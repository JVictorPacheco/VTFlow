using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class GetCards
{
    private static CardResponse ToResponse(Card card) => new(
        card.Id, card.Title, card.Description, card.DueDate, card.Priority, card.ColumnId, card.CreatedAt, card.Order,
        card.CardLabels.Select(cl => new LabelDto(cl.Label.Id, cl.Label.Name, cl.Label.Color)).ToList(),
        card.Subtasks.OrderBy(s => s.Id).Select(s => new SubtaskDto(s.Id, s.Title, s.IsCompleted)).ToList()
    );

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/cards", async (int? columnId, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var query = db.Cards
                .Include(c => c.CardLabels).ThenInclude(cl => cl.Label)
                .Include(c => c.Subtasks)
                .Where(c => c.UserId == null || c.UserId == userId)
                .AsQueryable();

            if (columnId.HasValue)
                query = query.Where(c => c.ColumnId == columnId.Value);

            var cards = await query.OrderBy(c => c.Order).ThenBy(c => c.CreatedAt).ToListAsync();
            return Results.Ok(cards.Select(ToResponse));
        }).RequireAuthorization();
}
