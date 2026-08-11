using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Columns;

public static class DeleteColumn
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/columns/{id}", async (int id, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var column = await db.Columns.FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));
            if (column is null) return Results.NotFound(new { error = "Column not found" });

            if (await db.Cards.AnyAsync(c => c.ColumnId == id && (c.UserId == null || c.UserId == userId)))
                return Results.Conflict(new { error = "Remova os cards antes de excluir a coluna" });

            db.Columns.Remove(column);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization();
}
