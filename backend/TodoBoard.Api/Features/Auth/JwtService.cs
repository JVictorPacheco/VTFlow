using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Auth;

public class JwtService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private string? _resolvedKey;

    public JwtService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: ResolveIssuer(),
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: CreateSigningCredentials()
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public TokenValidationParameters CreateValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = ResolveIssuer(),
            IssuerSigningKey = CreateSigningKey()
        };
    }

    private SymmetricSecurityKey CreateSigningKey()
    {
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ResolveKey()));
    }

    private SigningCredentials CreateSigningCredentials()
    {
        return new SigningCredentials(CreateSigningKey(), SecurityAlgorithms.HmacSha256);
    }

    private string ResolveKey()
    {
        if (_resolvedKey is not null)
            return _resolvedKey;

        _resolvedKey = TryResolveFromConfiguration()
                       ?? TryResolveFromEnvironment()
                       ?? TryResolveFromDevelopmentFallback();

        if (_resolvedKey is null)
        {
            throw new InvalidOperationException(
                "JWT key is not configured. Set 'Jwt:Key' via UserSecrets (dev) " +
                "or 'DOTNET_JWT_KEY' environment variable (prod).");
        }

        return _resolvedKey;
    }

    private string? TryResolveFromConfiguration()
    {
        var key = _configuration["Jwt:Key"];
        return string.IsNullOrWhiteSpace(key) || key == "CHANGE_ME" ? null : key;
    }

    private static string? TryResolveFromEnvironment()
    {
        var key = Environment.GetEnvironmentVariable("DOTNET_JWT_KEY");
        return string.IsNullOrWhiteSpace(key) ? null : key;
    }

    private string? TryResolveFromDevelopmentFallback()
    {
        return _environment.IsDevelopment() ? "dev-secret-key-for-local-development-only" : null;
    }

    private string ResolveIssuer()
    {
        return _configuration["Jwt:Issuer"] ?? "TodoBoardApi";
    }
}
