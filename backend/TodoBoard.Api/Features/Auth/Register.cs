using TodoBoard.Api.Features.Auth;

namespace TodoBoard.Api.Features.Auth;

public record RegisterRequest(string Username, string Password);

public static class Register
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/auth/register", async (RegisterRequest request, AuthService authService) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest(new { error = "Username and password are required" });

            if (request.Password.Length < 6)
                return Results.BadRequest(new { error = "Password must be at least 6 characters" });

            var (success, error) = await authService.RegisterAsync(request.Username, request.Password);
            if (!success)
                return Results.Conflict(new { error });

            return Results.StatusCode(201);
        }).AllowAnonymous();
}
