using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Boards;

public static class GetBoards
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/boards", async (AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var boards = await db.Boards
                .Where(b => b.UserId == null || b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Results.Ok(boards.Select(b => new BoardResponse(b.Id, b.Name, b.Description, b.CreatedAt)));
        }).RequireAuthorization();
}
