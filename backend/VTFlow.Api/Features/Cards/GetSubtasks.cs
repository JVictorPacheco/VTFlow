using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class GetSubtasks
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards/{cardId}/subtasks", async (int cardId, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (!await db.Cards.AnyAsync(c => c.Id == cardId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Card not found" });

            var subtasks = await db.Subtasks.Where(s => s.CardId == cardId).OrderBy(s => s.Id).ToListAsync();
            return Results.Ok(subtasks.Select(s => new SubtaskResponse(s.Id, s.Title, s.IsCompleted, s.CardId)));
        }).RequireAuthorization();
}
