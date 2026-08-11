using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class DeleteComment
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/cards/{cardId}/comments/{id}", async (int cardId, int id, AppDbContext db) =>
        {
            var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId);
            if (comment is null) return Results.NotFound(new { error = "Comment not found" });

            LogActivity(db, cardId, ActivityType.CommentDeleted, "Comentário removido.");
            db.Comments.Remove(comment);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();
}
