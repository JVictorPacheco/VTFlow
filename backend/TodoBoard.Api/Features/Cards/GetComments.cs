using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public static class GetComments
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards/{cardId}/comments", async (int cardId, AppDbContext db) =>
        {
            if (!await db.Cards.AnyAsync(c => c.Id == cardId))
                return Results.NotFound(new { error = "Card not found" });

            var comments = await db.Comments.Where(c => c.CardId == cardId).OrderBy(c => c.CreatedAt).ToListAsync();
            return Results.Ok(comments.Select(c => new CommentResponse(c.Id, c.Text, c.CreatedAt, c.UpdatedAt, c.CardId)));
        }).RequireAuthorization();
}
