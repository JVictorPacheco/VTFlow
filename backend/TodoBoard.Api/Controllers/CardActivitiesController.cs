using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record CardActivityResponse(int Id, string Type, string Description, DateTime CreatedAt, int CardId);

[ApiController]
[Route("cards/{cardId}/activities")]
[Authorize]
public class CardActivitiesController(AppDbContext db) : ControllerBase
{
    private static CardActivityResponse ToResponse(CardActivity a) =>
        new(a.Id, a.Type.ToString(), a.Description, a.CreatedAt, a.CardId);

    [HttpGet]
    public async Task<IActionResult> GetAll(int cardId)
    {
        if (!await db.Cards.AnyAsync(c => c.Id == cardId))
            return NotFound(new { error = "Card not found" });

        var activities = await db.CardActivities
            .Where(a => a.CardId == cardId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        return Ok(activities.Select(ToResponse));
    }
}
