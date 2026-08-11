using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class ReorderCard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPatch("/cards/{id}/order", async (int id, ReorderRequest request, AppDbContext db) =>
        {
            var card = await db.Cards.FindAsync(id);
            if (card is null) return Results.NotFound(new { error = "Card not found" });

            var siblings = await db.Cards
                .Where(c => c.ColumnId == card.ColumnId && c.Id != id)
                .OrderBy(c => c.Order)
                .ToListAsync();

            siblings.Insert(Math.Clamp(request.Order, 0, siblings.Count), card);

            for (int i = 0; i < siblings.Count; i++)
                siblings[i].Order = i;

            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization();
}

public record ReorderRequest(int Order);
