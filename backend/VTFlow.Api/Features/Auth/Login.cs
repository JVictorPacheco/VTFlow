using VTFlow.Api.Features.Auth;

namespace VTFlow.Api.Features.Auth;

public record LoginRequest(string Username, string Password);

public static class Login
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/auth/login", async (LoginRequest request, AuthService authService) =>
        {
            var token = await authService.LoginAsync(request.Username, request.Password);
            if (token is null)
                return Results.Unauthorized();

            return Results.Ok(new { token });
        }).AllowAnonymous();
}
