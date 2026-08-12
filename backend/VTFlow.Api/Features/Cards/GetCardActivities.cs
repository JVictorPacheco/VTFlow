using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public record CardActivityResponse(int Id, string Type, string Description, DateTime CreatedAt, int CardId);

public static class GetCardActivities
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards/{cardId}/activities", async (int cardId, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (!await db.Cards.AnyAsync(c => c.Id == cardId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Card not found" });

            var activities = await db.CardActivities.Where(a => a.CardId == cardId).OrderBy(a => a.CreatedAt).ToListAsync();
            return Results.Ok(activities.Select(a => new CardActivityResponse(a.Id, a.Type.ToString(), a.Description, a.CreatedAt, a.CardId)));
        }).RequireAuthorization();
}
