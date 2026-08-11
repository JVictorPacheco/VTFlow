using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Columns;

public static class ReorderColumn
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPatch("/columns/{id}/order", async (int id, ReorderRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var column = await db.Columns.FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));
            if (column is null) return Results.NotFound(new { error = "Column not found" });

            var target = await db.Columns.FirstOrDefaultAsync(c => c.Order == request.Order && (c.UserId == null || c.UserId == userId));
            if (target is not null && target.Id != id)
            {
                target.Order = column.Order;
            }

            column.Order = request.Order;
            await db.SaveChangesAsync();

            return Results.Ok();
        }).RequireAuthorization();
}
