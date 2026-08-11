using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Boards;

public static class UpdateBoard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/boards/{id}", async (int id, BoardRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == id && (b.UserId == null || b.UserId == userId));
            if (board is null) return Results.NotFound(new { error = "Board not found" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            board.Name = request.Name.Trim();
            board.Description = request.Description;
            await db.SaveChangesAsync();

            return Results.Ok(new BoardResponse(board.Id, board.Name, board.Description, board.CreatedAt));
        }).RequireAuthorization();
}
