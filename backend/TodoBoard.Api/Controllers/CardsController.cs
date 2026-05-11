using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record CardRequest(
    string Title,
    string? Description,
    DateTime? DueDate,
    Priority Priority,
    int ColumnId,
    List<int> LabelIds
);

public record MoveRequest(int ColumnId);

public record LabelDto(int Id, string Name, string Color);

public record SubtaskDto(int Id, string Title, bool IsCompleted);

public record CardResponse(
    int Id,
    string Title,
    string? Description,
    DateTime? DueDate,
    Priority Priority,
    int ColumnId,
    DateTime CreatedAt,
    int Order,
    List<LabelDto> Labels,
    List<SubtaskDto> Subtasks
);

[ApiController]
[Route("cards")]
[Authorize]
public class CardsController(AppDbContext db) : ControllerBase
{
    private static CardResponse ToResponse(Card card) => new(
        card.Id, card.Title, card.Description,
        card.DueDate, card.Priority, card.ColumnId, card.CreatedAt,
        card.Order,
        card.CardLabels.Select(cl => new LabelDto(cl.Label.Id, cl.Label.Name, cl.Label.Color)).ToList(),
        card.Subtasks.OrderBy(s => s.Id).Select(s => new SubtaskDto(s.Id, s.Title, s.IsCompleted)).ToList()
    );

    private void LogActivity(int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? columnId)
    {
        var query = db.Cards
            .Include(c => c.CardLabels).ThenInclude(cl => cl.Label)
            .Include(c => c.Subtasks)
            .AsQueryable();

        if (columnId.HasValue)
            query = query.Where(c => c.ColumnId == columnId.Value);

        var cards = await query.OrderBy(c => c.Order).ThenBy(c => c.CreatedAt).ToListAsync();
        return Ok(cards.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CardRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        if (!await db.Columns.AnyAsync(c => c.Id == request.ColumnId))
            return NotFound(new { error = "Column not found" });

        var card = new Card
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            DueDate = request.DueDate,
            Priority = request.Priority,
            ColumnId = request.ColumnId,
            CreatedAt = DateTime.UtcNow
        };

        var maxOrder = await db.Cards
            .Where(c => c.ColumnId == request.ColumnId)
            .Select(c => (int?)c.Order)
            .MaxAsync() ?? -1;
        card.Order = maxOrder + 1;

        db.Cards.Add(card);
        await db.SaveChangesAsync();

        LogActivity(card.Id, ActivityType.CardCreated, $"Card \"{card.Title}\" criado.");

        if (request.LabelIds.Count > 0)
        {
            var validLabels = await db.Labels
                .Where(l => request.LabelIds.Contains(l.Id))
                .ToListAsync();

            db.CardLabels.AddRange(validLabels.Select(l => new CardLabel { CardId = card.Id, LabelId = l.Id }));

            foreach (var label in validLabels)
                LogActivity(card.Id, ActivityType.LabelAdded, $"Etiqueta \"{label.Name}\" adicionada.");
        }

        await db.SaveChangesAsync();

        await db.Entry(card).Collection(c => c.CardLabels).Query()
            .Include(cl => cl.Label).LoadAsync();
        await db.Entry(card).Collection(c => c.Subtasks).LoadAsync();

        return StatusCode(201, ToResponse(card));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CardRequest request)
    {
        var card = await db.Cards
            .Include(c => c.CardLabels).ThenInclude(cl => cl.Label)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (card is null) return NotFound(new { error = "Card not found" });

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        if (!await db.Columns.AnyAsync(c => c.Id == request.ColumnId))
            return NotFound(new { error = "Column not found" });

        if (card.Priority != request.Priority)
            LogActivity(id, ActivityType.PriorityChanged, $"Prioridade alterada para \"{request.Priority}\".");

        var oldLabelIds = card.CardLabels.Select(cl => cl.LabelId).ToHashSet();
        var newLabelIds = request.LabelIds.ToHashSet();

        var removedLabelIds = oldLabelIds.Except(newLabelIds).ToList();
        var addedLabelIds = newLabelIds.Except(oldLabelIds).ToList();

        if (removedLabelIds.Count > 0)
        {
            var removedLabels = card.CardLabels.Where(cl => removedLabelIds.Contains(cl.LabelId)).Select(cl => cl.Label).ToList();
            foreach (var label in removedLabels)
                LogActivity(id, ActivityType.LabelRemoved, $"Etiqueta \"{label.Name}\" removida.");
        }

        if (addedLabelIds.Count > 0)
        {
            var addedLabels = await db.Labels.Where(l => addedLabelIds.Contains(l.Id)).ToListAsync();
            foreach (var label in addedLabels)
                LogActivity(id, ActivityType.LabelAdded, $"Etiqueta \"{label.Name}\" adicionada.");
        }

        card.Title = request.Title.Trim();
        card.Description = request.Description;
        card.DueDate = request.DueDate;
        card.Priority = request.Priority;
        card.ColumnId = request.ColumnId;

        db.CardLabels.RemoveRange(card.CardLabels);
        if (request.LabelIds.Count > 0)
        {
            var validIds = await db.Labels
                .Where(l => request.LabelIds.Contains(l.Id))
                .Select(l => l.Id).ToListAsync();
            db.CardLabels.AddRange(validIds.Select(lid => new CardLabel { CardId = card.Id, LabelId = lid }));
        }

        await db.SaveChangesAsync();

        await db.Entry(card).Collection(c => c.CardLabels).Query()
            .Include(cl => cl.Label).LoadAsync();
        await db.Entry(card).Collection(c => c.Subtasks).LoadAsync();

        return Ok(ToResponse(card));
    }

    [HttpPatch("{id}/column")]
    public async Task<IActionResult> Move(int id, MoveRequest request)
    {
        var card = await db.Cards.FindAsync(id);
        if (card is null) return NotFound(new { error = "Card not found" });

        var targetColumn = await db.Columns.FindAsync(request.ColumnId);
        if (targetColumn is null) return NotFound(new { error = "Column not found" });

        var maxOrder = await db.Cards
            .Where(c => c.ColumnId == request.ColumnId)
            .Select(c => (int?)c.Order)
            .MaxAsync() ?? -1;

        LogActivity(id, ActivityType.CardMoved, $"Card movido para a coluna \"{targetColumn.Name}\".");

        card.ColumnId = request.ColumnId;
        card.Order = maxOrder + 1;
        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpPatch("{id}/order")]
    public async Task<IActionResult> Reorder(int id, ReorderRequest request)
    {
        var card = await db.Cards.FindAsync(id);
        if (card is null) return NotFound(new { error = "Card not found" });

        var siblings = await db.Cards
            .Where(c => c.ColumnId == card.ColumnId && c.Id != id)
            .OrderBy(c => c.Order)
            .ToListAsync();

        siblings.Insert(Math.Clamp(request.Order, 0, siblings.Count), card);

        for (int i = 0; i < siblings.Count; i++)
            siblings[i].Order = i;

        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var card = await db.Cards
            .Include(c => c.CardLabels)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (card is null) return NotFound(new { error = "Card not found" });

        db.CardLabels.RemoveRange(card.CardLabels);
        db.Cards.Remove(card);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
