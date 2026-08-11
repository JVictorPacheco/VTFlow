using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Boards;

public static class GetBoardById
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/boards/{id}", async (int id, AppDbContext db) =>
        {
            var board = await db.Boards.FindAsync(id);
            if (board is null) return Results.NotFound(new { error = "Board not found" });

            return Results.Ok(new BoardResponse(board.Id, board.Name, board.Description, board.CreatedAt));
        }).RequireAuthorization();
}
