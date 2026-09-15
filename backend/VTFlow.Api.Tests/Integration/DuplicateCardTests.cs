using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace VTFlow.Api.Tests.Integration;

public class DuplicateCardTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public DuplicateCardTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static async Task<JsonElement> ReadJson(HttpContent content)
    {
        await using var stream = await content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        return doc.RootElement.Clone();
    }

    private async Task<HttpClient> CreateAuthenticatedClient(string username)
    {
        var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/auth/register", new { username, password = "senha123" });
        var login = await client.PostAsJsonAsync("/auth/login", new { username, password = "senha123" });
        var body = await ReadJson(login.Content);
        var token = body.GetProperty("token").GetString();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    // Cenário 1: Sucesso
    [Fact]
    public async Task Duplicate_Existing_Card_Copies_Title_Column_And_Labels_And_Logs_Activity()
    {
        var client = await CreateAuthenticatedClient("dup-sucesso");

        var boardResponse = await client.PostAsJsonAsync("/boards", new { name = "Board Dup", description = "teste" });
        var board = await ReadJson(boardResponse.Content);
        var boardId = board.GetProperty("id").GetInt32();

        var columns = await ReadJson((await client.GetAsync($"/columns?boardId={boardId}")).Content);
        var columnId = columns.EnumerateArray().First().GetProperty("id").GetInt32();

        var labelResponse = await client.PostAsJsonAsync("/labels", new { name = "Mercado", color = "#FF5733" });
        var label = await ReadJson(labelResponse.Content);
        var labelId = label.GetProperty("id").GetInt32();

        var cardResponse = await client.PostAsJsonAsync("/cards", new
        {
            title = "Comprar leite",
            description = "desc",
            priority = "Medium",
            columnId,
            labelIds = new[] { labelId }
        });
        var card = await ReadJson(cardResponse.Content);
        var cardId = card.GetProperty("id").GetInt32();

        var duplicateResponse = await client.PostAsync($"/cards/{cardId}/duplicate", null);
        Assert.Equal(HttpStatusCode.Created, duplicateResponse.StatusCode);

        var copy = await ReadJson(duplicateResponse.Content);
        Assert.Equal("Comprar leite (cópia)", copy.GetProperty("title").GetString());
        Assert.Equal(columnId, copy.GetProperty("columnId").GetInt32());

        var copyLabels = copy.GetProperty("labels").EnumerateArray().ToList();
        Assert.Single(copyLabels);
        Assert.Equal("Mercado", copyLabels[0].GetProperty("name").GetString());

        Assert.Empty(copy.GetProperty("subtasks").EnumerateArray());

        var copyId = copy.GetProperty("id").GetInt32();
        Assert.NotEqual(cardId, copyId);

        var copyActivities = await ReadJson((await client.GetAsync($"/cards/{copyId}/activities")).Content);
        var copyActivityTypes = copyActivities.EnumerateArray().Select(a => a.GetProperty("type").GetString()).ToList();
        Assert.Contains("CardCreated", copyActivityTypes);

        var originalActivities = await ReadJson((await client.GetAsync($"/cards/{cardId}/activities")).Content);
        var originalActivityTypes = originalActivities.EnumerateArray().Select(a => a.GetProperty("type").GetString()).ToList();
        Assert.Contains("CardDuplicated", originalActivityTypes);
    }

    // Cenário 2: Card inexistente
    [Fact]
    public async Task Duplicate_Nonexistent_Card_Returns_NotFound()
    {
        var client = await CreateAuthenticatedClient("dup-404");

        var response = await client.PostAsync("/cards/999999/duplicate", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // Cenário 3: Sem autenticação
    [Fact]
    public async Task Duplicate_Without_Token_Returns_Unauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/cards/1/duplicate", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Cenário 4: Duplicar uma cópia — numeração crescente em vez de empilhar sufixos
    [Fact]
    public async Task Duplicate_A_Copy_Increments_Copy_Number_Instead_Of_Stacking_Suffix()
    {
        var client = await CreateAuthenticatedClient("dup-numerado");

        var boardResponse = await client.PostAsJsonAsync("/boards", new { name = "Board Dup Numerado", description = "teste" });
        var board = await ReadJson(boardResponse.Content);
        var boardId = board.GetProperty("id").GetInt32();

        var columns = await ReadJson((await client.GetAsync($"/columns?boardId={boardId}")).Content);
        var columnId = columns.EnumerateArray().First().GetProperty("id").GetInt32();

        var cardResponse = await client.PostAsJsonAsync("/cards", new
        {
            title = "Comprar leite",
            priority = "Medium",
            columnId,
            labelIds = Array.Empty<int>()
        });
        var card = await ReadJson(cardResponse.Content);
        var cardId = card.GetProperty("id").GetInt32();

        var firstCopyResponse = await client.PostAsync($"/cards/{cardId}/duplicate", null);
        var firstCopy = await ReadJson(firstCopyResponse.Content);
        Assert.Equal("Comprar leite (cópia)", firstCopy.GetProperty("title").GetString());
        var firstCopyId = firstCopy.GetProperty("id").GetInt32();

        var secondCopyResponse = await client.PostAsync($"/cards/{firstCopyId}/duplicate", null);
        var secondCopy = await ReadJson(secondCopyResponse.Content);
        Assert.Equal("Comprar leite (cópia 2)", secondCopy.GetProperty("title").GetString());
        var secondCopyId = secondCopy.GetProperty("id").GetInt32();

        var thirdCopyResponse = await client.PostAsync($"/cards/{secondCopyId}/duplicate", null);
        var thirdCopy = await ReadJson(thirdCopyResponse.Content);
        Assert.Equal("Comprar leite (cópia 3)", thirdCopy.GetProperty("title").GetString());
    }
}
