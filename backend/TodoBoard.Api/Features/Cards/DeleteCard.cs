using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class DeleteCard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/cards/{id}", async (int id, AppDbContext db) =>
        {
            var card = await db.Cards.Include(c => c.CardLabels).FirstOrDefaultAsync(c => c.Id == id);
            if (card is null) return Results.NotFound(new { error = "Card not found" });

            db.CardLabels.RemoveRange(card.CardLabels);
            db.Cards.Remove(card);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();
}
