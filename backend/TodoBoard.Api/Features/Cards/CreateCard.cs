using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Features.Labels;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public record CardRequest(string Title, string? Description, DateTime? DueDate, Priority Priority, int ColumnId, List<int> LabelIds);
public record MoveRequest(int ColumnId);
public record LabelDto(int Id, string Name, string Color);
public record SubtaskDto(int Id, string Title, bool IsCompleted);
public record CardResponse(int Id, string Title, string? Description, DateTime? DueDate, Priority Priority, int ColumnId, DateTime CreatedAt, int Order, List<LabelDto> Labels, List<SubtaskDto> Subtasks);

public static class CreateCard
{
    private static CardResponse ToResponse(Card card) => new(
        card.Id, card.Title, card.Description, card.DueDate, card.Priority, card.ColumnId, card.CreatedAt, card.Order,
        card.CardLabels.Select(cl => new LabelDto(cl.Label.Id, cl.Label.Name, cl.Label.Color)).ToList(),
        card.Subtasks.OrderBy(s => s.Id).Select(s => new SubtaskDto(s.Id, s.Title, s.IsCompleted)).ToList()
    );

    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/cards", async (CardRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Title is required" });

            if (!await db.Columns.AnyAsync(c => c.Id == request.ColumnId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Column not found" });

            var card = new Card
            {
                Title = request.Title.Trim(),
                Description = request.Description,
                DueDate = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
                Priority = request.Priority,
                ColumnId = request.ColumnId,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var maxOrder = await db.Cards.Where(c => c.ColumnId == request.ColumnId && (c.UserId == null || c.UserId == userId)).Select(c => (int?)c.Order).MaxAsync() ?? -1;
            card.Order = maxOrder + 1;

            db.Cards.Add(card);
            await db.SaveChangesAsync();

            LogActivity(db, card.Id, ActivityType.CardCreated, $"Card \"{card.Title}\" criado.");

            if (request.LabelIds.Count > 0)
            {
                var validLabels = await db.Labels.Where(l => request.LabelIds.Contains(l.Id)).ToListAsync();
                db.CardLabels.AddRange(validLabels.Select(l => new CardLabel { CardId = card.Id, LabelId = l.Id }));
                foreach (var label in validLabels)
                    LogActivity(db, card.Id, ActivityType.LabelAdded, $"Etiqueta \"{label.Name}\" adicionada.");
            }

            await db.SaveChangesAsync();
            await db.Entry(card).Collection(c => c.CardLabels).Query().Include(cl => cl.Label).LoadAsync();
            await db.Entry(card).Collection(c => c.Subtasks).LoadAsync();

            return Results.Created($"/cards/{card.Id}", ToResponse(card));
        }).RequireAuthorization();
}
