using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record LabelRequest(string Name, string Color);

[ApiController]
[Route("labels")]
[Authorize]
public class LabelsController(AppDbContext db) : ControllerBase
{
    private static readonly Regex HexColorRegex = new(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var labels = await db.Labels.OrderBy(l => l.Name).ToListAsync();
        return Ok(labels);
    }

    [HttpPost]
    public async Task<IActionResult> Create(LabelRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        if (!HexColorRegex.IsMatch(request.Color))
            return BadRequest(new { error = "Color must be a valid hex color (e.g. #FF5733)" });

        if (await db.Labels.AnyAsync(l => l.Name == request.Name))
            return Conflict(new { error = "Label name already exists" });

        var label = new Label { Name = request.Name.Trim(), Color = request.Color };
        db.Labels.Add(label);
        await db.SaveChangesAsync();

        return StatusCode(201, label);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, LabelRequest request)
    {
        var label = await db.Labels.FindAsync(id);
        if (label is null) return NotFound(new { error = "Label not found" });

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        if (!HexColorRegex.IsMatch(request.Color))
            return BadRequest(new { error = "Color must be a valid hex color" });

        label.Name = request.Name.Trim();
        label.Color = request.Color;
        await db.SaveChangesAsync();

        return Ok(label);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var label = await db.Labels.FindAsync(id);
        if (label is null) return NotFound(new { error = "Label not found" });

        db.Labels.Remove(label);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
