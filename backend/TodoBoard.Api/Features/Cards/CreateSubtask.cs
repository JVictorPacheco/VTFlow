using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public record SubtaskRequest(string Title);
public record SubtaskResponse(int Id, string Title, bool IsCompleted, int CardId);

public static class CreateSubtask
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/cards/{cardId}/subtasks", async (int cardId, SubtaskRequest request, AppDbContext db) =>
        {
            if (!await db.Cards.AnyAsync(c => c.Id == cardId))
                return Results.NotFound(new { error = "Card not found" });

            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Title is required" });

            var subtask = new Subtask { Title = request.Title.Trim(), CardId = cardId };
            db.Subtasks.Add(subtask);
            await db.SaveChangesAsync();

            LogActivity(db, cardId, ActivityType.SubtaskAdded, $"Subtarefa \"{subtask.Title}\" adicionada.");
            await db.SaveChangesAsync();

            return Results.Created($"/cards/{cardId}/subtasks/{subtask.Id}", new SubtaskResponse(subtask.Id, subtask.Title, subtask.IsCompleted, subtask.CardId));
        }).RequireAuthorization();
}
