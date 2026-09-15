using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class UpdateComment
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/cards/{cardId}/comments/{id}", async (int cardId, int id, CommentRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId && (c.Card.UserId == null || c.Card.UserId == userId));
            if (comment is null) return Results.NotFound(new { error = "Comment not found" });

            if (string.IsNullOrWhiteSpace(request.Text))
                return Results.BadRequest(new { error = "Text is required" });

            comment.Text = request.Text.Trim();
            comment.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(new CommentResponse(comment.Id, comment.Text, comment.CreatedAt, comment.UpdatedAt, comment.CardId));
        }).RequireAuthorization();
}
