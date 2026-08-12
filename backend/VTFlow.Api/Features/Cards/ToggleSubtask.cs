using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public record ToggleRequest(bool IsCompleted);

public static class ToggleSubtask
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPatch("/cards/{cardId}/subtasks/{id}/toggle", async (int cardId, int id, ToggleRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var subtask = await db.Subtasks.FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId && (s.Card.UserId == null || s.Card.UserId == userId));
            if (subtask is null) return Results.NotFound(new { error = "Subtask not found" });

            subtask.IsCompleted = request.IsCompleted;

            var type = request.IsCompleted ? ActivityType.SubtaskCompleted : ActivityType.SubtaskReopened;
            var verb = request.IsCompleted ? "concluída" : "reaberta";
            LogActivity(db, cardId, type, $"Subtarefa \"{subtask.Title}\" {verb}.");

            await db.SaveChangesAsync();
            return Results.Ok(new SubtaskResponse(subtask.Id, subtask.Title, subtask.IsCompleted, subtask.CardId));
        }).RequireAuthorization();
}
