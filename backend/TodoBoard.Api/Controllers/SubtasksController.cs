using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record SubtaskRequest(string Title);
public record SubtaskResponse(int Id, string Title, bool IsCompleted, int CardId);
public record ToggleRequest(bool IsCompleted);
public record RenameSubtaskRequest(string Title);

[ApiController]
[Route("cards/{cardId}/subtasks")]
[Authorize]
public class SubtasksController(AppDbContext db) : ControllerBase
{
    private static SubtaskResponse ToResponse(Subtask s) =>
        new(s.Id, s.Title, s.IsCompleted, s.CardId);

    private void LogActivity(int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    [HttpGet]
    public async Task<IActionResult> GetAll(int cardId)
    {
        if (!await db.Cards.AnyAsync(c => c.Id == cardId))
            return NotFound(new { error = "Card not found" });

        var subtasks = await db.Subtasks
            .Where(s => s.CardId == cardId)
            .OrderBy(s => s.Id)
            .ToListAsync();

        return Ok(subtasks.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create(int cardId, SubtaskRequest request)
    {
        if (!await db.Cards.AnyAsync(c => c.Id == cardId))
            return NotFound(new { error = "Card not found" });

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        var subtask = new Subtask
        {
            Title = request.Title.Trim(),
            CardId = cardId
        };

        db.Subtasks.Add(subtask);
        await db.SaveChangesAsync();

        LogActivity(cardId, ActivityType.SubtaskAdded, $"Subtarefa \"{subtask.Title}\" adicionada.");
        await db.SaveChangesAsync();

        return StatusCode(201, ToResponse(subtask));
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(int cardId, int id, ToggleRequest request)
    {
        var subtask = await db.Subtasks
            .FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId);

        if (subtask is null) return NotFound(new { error = "Subtask not found" });

        subtask.IsCompleted = request.IsCompleted;

        var type = request.IsCompleted ? ActivityType.SubtaskCompleted : ActivityType.SubtaskReopened;
        var verb = request.IsCompleted ? "concluída" : "reaberta";
        LogActivity(cardId, type, $"Subtarefa \"{subtask.Title}\" {verb}.");

        await db.SaveChangesAsync();
        return Ok(ToResponse(subtask));
    }

    [HttpPatch("{id}/rename")]
    public async Task<IActionResult> Rename(int cardId, int id, RenameSubtaskRequest request)
    {
        var subtask = await db.Subtasks
            .FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId);

        if (subtask is null) return NotFound(new { error = "Subtask not found" });

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        var oldTitle = subtask.Title;
        subtask.Title = request.Title.Trim();

        LogActivity(cardId, ActivityType.SubtaskRenamed, $"Subtarefa \"{oldTitle}\" renomeada para \"{subtask.Title}\".");

        await db.SaveChangesAsync();
        return Ok(ToResponse(subtask));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int cardId, int id)
    {
        var subtask = await db.Subtasks
            .FirstOrDefaultAsync(s => s.Id == id && s.CardId == cardId);

        if (subtask is null) return NotFound(new { error = "Subtask not found" });

        LogActivity(cardId, ActivityType.SubtaskDeleted, $"Subtarefa \"{subtask.Title}\" removida.");

        db.Subtasks.Remove(subtask);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
