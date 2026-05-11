using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoBoard.Api.Services;

namespace TodoBoard.Api.Controllers;

public record RegisterRequest(string Username, string Password);
public record LoginRequest(string Username, string Password);

[ApiController]
[Route("auth")]
[AllowAnonymous]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Username and password are required" });

        if (request.Password.Length < 6)
            return BadRequest(new { error = "Password must be at least 6 characters" });

        var (success, error) = await authService.RegisterAsync(request.Username, request.Password);
        if (!success)
            return Conflict(new { error });

        return StatusCode(201);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await authService.LoginAsync(request.Username, request.Password);
        if (token is null)
            return Unauthorized(new { error = "Invalid credentials" });

        return Ok(new { token });
    }
}
