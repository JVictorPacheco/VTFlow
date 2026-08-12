using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public record CommentRequest(string Text);
public record CommentResponse(int Id, string Text, DateTime CreatedAt, DateTime? UpdatedAt, int CardId);

public static class CreateComment
{
    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/cards/{cardId}/comments", async (int cardId, CommentRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (!await db.Cards.AnyAsync(c => c.Id == cardId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Card not found" });

            if (string.IsNullOrWhiteSpace(request.Text))
                return Results.BadRequest(new { error = "Text is required" });

            var comment = new Comment { Text = request.Text.Trim(), CardId = cardId, CreatedAt = DateTime.UtcNow };
            db.Comments.Add(comment);
            await db.SaveChangesAsync();

            LogActivity(db, cardId, ActivityType.CommentAdded, "Comentário adicionado.");
            await db.SaveChangesAsync();

            return Results.Created($"/cards/{cardId}/comments/{comment.Id}", new CommentResponse(comment.Id, comment.Text, comment.CreatedAt, comment.UpdatedAt, comment.CardId));
        }).RequireAuthorization();
}
