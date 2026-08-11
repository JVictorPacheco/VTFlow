using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Boards;

public static class DeleteBoard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/boards/{id}", async (int id, AppDbContext db) =>
        {
            var board = await db.Boards.FindAsync(id);
            if (board is null) return Results.NotFound(new { error = "Board not found" });

            db.Boards.Remove(board);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization();
}
