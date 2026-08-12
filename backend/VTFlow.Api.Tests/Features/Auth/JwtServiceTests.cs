using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;
using VTFlow.Api.Features.Auth;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Tests.Features.Auth;

public class JwtServiceTests
{
    private static JwtService CreateJwtService(string? key = null, string? issuer = null)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = key ?? "test-key-with-enough-length-1234567890",
                ["Jwt:Issuer"] = issuer ?? "VTFlowApi"
            })
            .Build();

        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(e => e.EnvironmentName).Returns(Environments.Development);

        return new JwtService(config, environment.Object);
    }

    [Fact]
    public void GenerateToken_Contains_Subject_And_Username_Claims()
    {
        var jwt = CreateJwtService();
        var user = new User { Id = 42, Username = "maria" };

        var token = jwt.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal("42", jwtToken.Subject);
        Assert.Equal("maria", jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.UniqueName).Value);
    }

    [Fact]
    public void GenerateToken_Expires_In_Eight_Hours()
    {
        var jwt = CreateJwtService();
        var user = new User { Id = 1, Username = "joao" };

        var token = jwt.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var expectedExpiry = DateTime.UtcNow.AddHours(8);
        Assert.True((jwtToken.ValidTo - expectedExpiry).Duration() < TimeSpan.FromMinutes(1));
    }

    [Fact]
    public void CreateValidationParameters_Validates_Issuer()
    {
        var jwt = CreateJwtService();

        var parameters = jwt.CreateValidationParameters();

        Assert.True(parameters.ValidateIssuer);
        Assert.Equal("VTFlowApi", parameters.ValidIssuer);
        Assert.False(parameters.ValidateAudience);
    }

    [Fact]
    public void GenerateToken_Uses_Configured_Issuer()
    {
        var jwt = CreateJwtService(issuer: "MeuIssuer");
        var user = new User { Id = 1, Username = "joao" };

        var token = jwt.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal("MeuIssuer", jwtToken.Issuer);
    }
}
