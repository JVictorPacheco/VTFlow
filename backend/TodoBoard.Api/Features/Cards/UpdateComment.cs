using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class UpdateComment
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/cards/{cardId}/comments/{id}", async (int cardId, int id, CommentRequest request, AppDbContext db) =>
        {
            var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId);
            if (comment is null) return Results.NotFound(new { error = "Comment not found" });

            if (string.IsNullOrWhiteSpace(request.Text))
                return Results.BadRequest(new { error = "Text is required" });

            comment.Text = request.Text.Trim();
            comment.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(new CommentResponse(comment.Id, comment.Text, comment.CreatedAt, comment.UpdatedAt, comment.CardId));
        }).RequireAuthorization();
}
