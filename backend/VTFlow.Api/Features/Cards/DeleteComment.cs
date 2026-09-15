using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class DeleteComment
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/cards/{cardId}/comments/{id}", async (int cardId, int id, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId && (c.Card.UserId == null || c.Card.UserId == userId));
            if (comment is null) return Results.NotFound(new { error = "Comment not found" });

            LogActivity(db, cardId, ActivityType.CommentDeleted, "Comentário removido.");
            db.Comments.Remove(comment);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();
}
