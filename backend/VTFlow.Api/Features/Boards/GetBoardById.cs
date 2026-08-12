using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Boards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Boards;

public static class GetBoardById
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/boards/{id}", async (int id, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == id && (b.UserId == null || b.UserId == userId));
            if (board is null) return Results.NotFound(new { error = "Board not found" });

            return Results.Ok(new BoardResponse(board.Id, board.Name, board.Description, board.CreatedAt));
        }).RequireAuthorization();
}
