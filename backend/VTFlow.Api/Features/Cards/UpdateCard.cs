using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static class UpdateCard
{
    private static CardResponse ToResponse(Card card) => new(
        card.Id, card.Title, card.Description, card.DueDate, card.Priority, card.ColumnId, card.CreatedAt, card.Order,
        card.CardLabels.Select(cl => new LabelDto(cl.Label.Id, cl.Label.Name, cl.Label.Color)).ToList(),
        card.Subtasks.OrderBy(s => s.Id).Select(s => new SubtaskDto(s.Id, s.Title, s.IsCompleted)).ToList()
    );

    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/cards/{id}", async (int id, CardRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var card = await db.Cards
                .Include(c => c.CardLabels).ThenInclude(cl => cl.Label)
                .FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));

            if (card is null) return Results.NotFound(new { error = "Card not found" });

            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Title is required" });

            if (!await db.Columns.AnyAsync(c => c.Id == request.ColumnId && (c.UserId == null || c.UserId == userId)))
                return Results.NotFound(new { error = "Column not found" });

            if (card.Priority != request.Priority)
                LogActivity(db, id, ActivityType.PriorityChanged, $"Prioridade alterada para \"{request.Priority}\".");

            var oldLabelIds = card.CardLabels.Select(cl => cl.LabelId).ToHashSet();
            var newLabelIds = request.LabelIds.ToHashSet();
            var removedLabelIds = oldLabelIds.Except(newLabelIds).ToList();
            var addedLabelIds = newLabelIds.Except(oldLabelIds).ToList();

            if (removedLabelIds.Count > 0)
            {
                var removedLabels = card.CardLabels.Where(cl => removedLabelIds.Contains(cl.LabelId)).Select(cl => cl.Label).ToList();
                foreach (var label in removedLabels)
                    LogActivity(db, id, ActivityType.LabelRemoved, $"Etiqueta \"{label.Name}\" removida.");
            }

            if (addedLabelIds.Count > 0)
            {
                var addedLabels = await db.Labels.Where(l => addedLabelIds.Contains(l.Id)).ToListAsync();
                foreach (var label in addedLabels)
                    LogActivity(db, id, ActivityType.LabelAdded, $"Etiqueta \"{label.Name}\" adicionada.");
            }

            card.Title = request.Title.Trim();
            card.Description = request.Description;
            card.DueDate = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null;
            card.Priority = request.Priority;
            card.ColumnId = request.ColumnId;

            db.CardLabels.RemoveRange(card.CardLabels);
            if (request.LabelIds.Count > 0)
            {
                var validIds = await db.Labels.Where(l => request.LabelIds.Contains(l.Id)).Select(l => l.Id).ToListAsync();
                db.CardLabels.AddRange(validIds.Select(lid => new CardLabel { CardId = card.Id, LabelId = lid }));
            }

            await db.SaveChangesAsync();
            await db.Entry(card).Collection(c => c.CardLabels).Query().Include(cl => cl.Label).LoadAsync();
            await db.Entry(card).Collection(c => c.Subtasks).LoadAsync();

            return Results.Ok(ToResponse(card));
        }).RequireAuthorization();
}
