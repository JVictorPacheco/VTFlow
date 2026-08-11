using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public record RenameSubtaskRequest(string Title);

public static class RenameSubtask
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPatch("/cards/{cardId}/subtasks/{id}/rename", async (int cardId, int id, RenameSubtaskRequest request, AppDbContext db) =>
        {
            var subtask = await db.Subtasks.FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId);
            if (subtask is null) return Results.NotFound(new { error = "Subtask not found" });

            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Title is required" });

            var oldTitle = subtask.Title;
            subtask.Title = request.Title.Trim();
            LogActivity(db, cardId, ActivityType.SubtaskRenamed, $"Subtarefa \"{oldTitle}\" renomeada para \"{subtask.Title}\".");
            await db.SaveChangesAsync();

            return Results.Ok(new SubtaskResponse(subtask.Id, subtask.Title, subtask.IsCompleted, subtask.CardId));
        }).RequireAuthorization();
}
