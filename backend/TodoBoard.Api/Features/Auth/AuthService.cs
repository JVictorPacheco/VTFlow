using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Auth;

public class AuthService(AppDbContext db, JwtService jwtService)
{
    public async Task<(bool Success, string? Error)> RegisterAsync(string username, string password)
    {
        if (await db.Users.AnyAsync(u => u.Username == username))
            return (false, "Username already exists");

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<string?> LoginAsync(string username, string password)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        return jwtService.GenerateToken(user);
    }
}
