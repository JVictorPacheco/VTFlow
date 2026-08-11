using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class GetSubtasks
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards/{cardId}/subtasks", async (int cardId, AppDbContext db) =>
        {
            if (!await db.Cards.AnyAsync(c => c.Id == cardId))
                return Results.NotFound(new { error = "Card not found" });

            var subtasks = await db.Subtasks.Where(s => s.CardId == cardId).OrderBy(s => s.Id).ToListAsync();
            return Results.Ok(subtasks.Select(s => new SubtaskResponse(s.Id, s.Title, s.IsCompleted, s.CardId)));
        }).RequireAuthorization();
}
