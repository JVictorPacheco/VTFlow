using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class DeleteSubtask
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/cards/{cardId}/subtasks/{id}", async (int cardId, int id, AppDbContext db) =>
        {
            var subtask = await db.Subtasks.FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId);
            if (subtask is null) return Results.NotFound(new { error = "Subtask not found" });

            LogActivity(db, cardId, ActivityType.SubtaskDeleted, $"Subtarefa \"{subtask.Title}\" removida.");
            db.Subtasks.Remove(subtask);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();
}
