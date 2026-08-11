using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class MoveCard
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPatch("/cards/{id}/column", async (int id, MoveRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));
            if (card is null) return Results.NotFound(new { error = "Card not found" });

            var targetColumn = await db.Columns.FirstOrDefaultAsync(c => c.Id == request.ColumnId && (c.UserId == null || c.UserId == userId));
            if (targetColumn is null) return Results.NotFound(new { error = "Column not found" });

            var maxOrder = await db.Cards.Where(c => c.ColumnId == request.ColumnId && (c.UserId == null || c.UserId == userId)).Select(c => (int?)c.Order).MaxAsync() ?? -1;

            LogActivity(db, id, ActivityType.CardMoved, $"Card movido para a coluna \"{targetColumn.Name}\".");

            card.ColumnId = request.ColumnId;
            card.Order = maxOrder + 1;
            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization();
}
