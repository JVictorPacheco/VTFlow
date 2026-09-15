using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace VTFlow.Api.Tests.Integration;

public class ApiIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ApiIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static async Task<JsonElement> ReadJson(HttpContent content)
    {
        await using var stream = await content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        return doc.RootElement.Clone();
    }

    [Fact]
    public async Task Health_Returns_Ok_Without_Auth()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Protected_Endpoint_Returns_Unauthorized_Without_Token()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/boards");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Full_Flow_Register_Login_Board_Card_Move()
    {
        var client = _factory.CreateClient();

        // 1. Registrar
        var registerResponse = await client.PostAsJsonAsync("/auth/register",
            new { username = "integracao", password = "senha123" });
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        // 2. Login
        var loginResponse = await client.PostAsJsonAsync("/auth/login",
            new { username = "integracao", password = "senha123" });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginBody = await ReadJson(loginResponse.Content);
        var token = loginBody.GetProperty("token").GetString();
        Assert.False(string.IsNullOrEmpty(token));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 3. Criar board
        var boardResponse = await client.PostAsJsonAsync("/boards",
            new { name = "Board Integracao", description = "teste" });
        Assert.Equal(HttpStatusCode.Created, boardResponse.StatusCode);

        var board = await ReadJson(boardResponse.Content);
        var boardId = board.GetProperty("id").GetInt32();
        Assert.True(boardId > 0);

        // 4. Board auto-criou 3 colunas
        var columnsResponse = await client.GetAsync($"/columns?boardId={boardId}");
        Assert.Equal(HttpStatusCode.OK, columnsResponse.StatusCode);

        var columns = await ReadJson(columnsResponse.Content);
        var columnsArray = columns.EnumerateArray().ToList();
        Assert.Equal(3, columnsArray.Count);

        var firstColumnId = columnsArray[0].GetProperty("id").GetInt32();
        var secondColumnId = columnsArray[1].GetProperty("id").GetInt32();

        // 5. Criar card na primeira coluna
        var cardResponse = await client.PostAsJsonAsync("/cards",
            new { title = "Card Integracao", description = "desc", priority = "Medium", columnId = firstColumnId, labelIds = Array.Empty<int>() });
        Assert.Equal(HttpStatusCode.Created, cardResponse.StatusCode);

        var card = await ReadJson(cardResponse.Content);
        var cardId = card.GetProperty("id").GetInt32();
        Assert.True(cardId > 0);

        // 6. Mover card para segunda coluna
        var moveResponse = await client.PatchAsJsonAsync($"/cards/{cardId}/column",
            new { columnId = secondColumnId });
        Assert.Equal(HttpStatusCode.OK, moveResponse.StatusCode);

        // 7. Verificar atividade registrada
        var activitiesResponse = await client.GetAsync($"/cards/{cardId}/activities");
        Assert.Equal(HttpStatusCode.OK, activitiesResponse.StatusCode);

        var activities = await ReadJson(activitiesResponse.Content);
        var activityTypes = activities.EnumerateArray()
            .Select(a => a.GetProperty("type").GetString())
            .ToList();
        Assert.Contains("CardCreated", activityTypes);
        Assert.Contains("CardMoved", activityTypes);
    }

    [Fact]
    public async Task Register_Duplicate_Username_Returns_Conflict()
    {
        var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/auth/register", new { username = "dup", password = "senha123" });
        var duplicate = await client.PostAsJsonAsync("/auth/register", new { username = "dup", password = "outrasenha" });

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task Login_Wrong_Password_Returns_Unauthorized()
    {
        var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/auth/register", new { username = "loginuser", password = "senha123" });
        var login = await client.PostAsJsonAsync("/auth/login", new { username = "loginuser", password = "errada" });

        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }
}
