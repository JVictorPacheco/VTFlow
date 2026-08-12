using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class GetComments
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards/{cardId}/comments", async (int cardId, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (!await db.Cards.AnyAsync(c => c.Id == cardId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Card not found" });

            var comments = await db.Comments.Where(c => c.CardId == cardId).OrderBy(c => c.CreatedAt).ToListAsync();
            return Results.Ok(comments.Select(c => new CommentResponse(c.Id, c.Text, c.CreatedAt, c.UpdatedAt, c.CardId)));
        }).RequireAuthorization();
}
