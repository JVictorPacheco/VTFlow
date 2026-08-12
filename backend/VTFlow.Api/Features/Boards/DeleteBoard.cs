using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Boards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Boards;

public static class DeleteBoard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/boards/{id}", async (int id, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == id && (b.UserId == null || b.UserId == userId));
            if (board is null) return Results.NotFound(new { error = "Board not found" });

            db.Boards.Remove(board);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization();
}
