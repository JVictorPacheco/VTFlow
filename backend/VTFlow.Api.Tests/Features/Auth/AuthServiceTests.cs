using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting;
using Moq;
using VTFlow.Api.Features.Auth;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Tests.Features.Auth;

public class AuthServiceTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static JwtService CreateJwtService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-key-with-enough-length-1234567890",
                ["Jwt:Issuer"] = "VTFlowApi"
            })
            .Build();

        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(e => e.EnvironmentName).Returns(Environments.Development);

        return new JwtService(config, environment.Object);
    }

    [Fact]
    public async Task Register_Creates_User_With_Hashed_Password()
    {
        var db = CreateDbContext();
        var service = new AuthService(db, CreateJwtService());

        var (success, error) = await service.RegisterAsync("user1", "senha123");

        Assert.True(success);
        Assert.Null(error);

        var user = await db.Users.SingleAsync(u => u.Username == "user1");
        Assert.NotEqual("senha123", user.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("senha123", user.PasswordHash));
    }

    [Fact]
    public async Task Register_Duplicate_Username_Returns_Error()
    {
        var db = CreateDbContext();
        var service = new AuthService(db, CreateJwtService());

        await service.RegisterAsync("user1", "senha123");
        var (success, error) = await service.RegisterAsync("user1", "outrasenha");

        Assert.False(success);
        Assert.Equal("Username already exists", error);
        Assert.Equal(1, await db.Users.CountAsync());
    }

    [Fact]
    public async Task Login_Valid_Credentials_Returns_Token()
    {
        var db = CreateDbContext();
        var service = new AuthService(db, CreateJwtService());

        await service.RegisterAsync("user1", "senha123");
        var token = await service.LoginAsync("user1", "senha123");

        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task Login_Wrong_Password_Returns_Null()
    {
        var db = CreateDbContext();
        var service = new AuthService(db, CreateJwtService());

        await service.RegisterAsync("user1", "senha123");
        var token = await service.LoginAsync("user1", "senha-errada");

        Assert.Null(token);
    }

    [Fact]
    public async Task Login_Unknown_User_Returns_Null()
    {
        var db = CreateDbContext();
        var service = new AuthService(db, CreateJwtService());

        var token = await service.LoginAsync("nao-existe", "senha123");

        Assert.Null(token);
    }
}
