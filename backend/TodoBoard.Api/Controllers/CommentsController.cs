using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record CommentRequest(string Text);
public record CommentResponse(int Id, string Text, DateTime CreatedAt, DateTime? UpdatedAt, int CardId);

[ApiController]
[Route("cards/{cardId}/comments")]
[Authorize]
public class CommentsController(AppDbContext db) : ControllerBase
{
    private static CommentResponse ToResponse(Comment c) =>
        new(c.Id, c.Text, c.CreatedAt, c.UpdatedAt, c.CardId);

    private void LogActivity(int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    [HttpGet]
    public async Task<IActionResult> GetAll(int cardId)
    {
        if (!await db.Cards.AnyAsync(c => c.Id == cardId))
            return NotFound(new { error = "Card not found" });

        var comments = await db.Comments
            .Where(c => c.CardId == cardId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return Ok(comments.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create(int cardId, CommentRequest request)
    {
        if (!await db.Cards.AnyAsync(c => c.Id == cardId))
            return NotFound(new { error = "Card not found" });

        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Text is required" });

        var comment = new Comment
        {
            Text = request.Text.Trim(),
            CardId = cardId,
            CreatedAt = DateTime.UtcNow
        };

        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        LogActivity(cardId, ActivityType.CommentAdded, "Comentário adicionado.");
        await db.SaveChangesAsync();

        return StatusCode(201, ToResponse(comment));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int cardId, int id, CommentRequest request)
    {
        var comment = await db.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId);

        if (comment is null) return NotFound(new { error = "Comment not found" });

        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Text is required" });

        comment.Text = request.Text.Trim();
        comment.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(ToResponse(comment));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int cardId, int id)
    {
        var comment = await db.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.CardId == cardId);

        if (comment is null) return NotFound(new { error = "Comment not found" });

        LogActivity(cardId, ActivityType.CommentDeleted, "Comentário removido.");

        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
