using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record ColumnRequest(string Name, int BoardId);
public record ReorderRequest(int Order);
public record ColumnResponse(int Id, string Name, int Order, int BoardId);


[ApiController]
[Route("columns")]
[Authorize]
public class ColumnsController(AppDbContext db) : ControllerBase
{
    private static ColumnResponse ToResponse(Column c) => new(c.Id, c.Name, c.Order, c.BoardId);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? boardId)
    {
        if (!boardId.HasValue)
            return BadRequest(new { error = "boardId is required" });

        if (!await db.Boards.AnyAsync(b => b.Id == boardId.Value))
            return NotFound(new { error = "Board not found" });

        var columns = await db.Columns
            .Where(c => c.BoardId == boardId.Value)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return Ok(columns.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create(ColumnRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        if (!await db.Boards.AnyAsync(b => b.Id == request.BoardId))
            return NotFound(new { error = "Board not found" });

        if (await db.Columns.AnyAsync(c => c.Name == request.Name && c.BoardId == request.BoardId))
            return Conflict(new { error = "Column name already exists in this board" });

        var maxOrder = await db.Columns
            .Where(c => c.BoardId == request.BoardId)
            .AnyAsync()
                ? await db.Columns.Where(c => c.BoardId == request.BoardId).MaxAsync(c => c.Order)
                : 0;

        var column = new Column { Name = request.Name.Trim(), Order = maxOrder + 1, BoardId = request.BoardId };
        db.Columns.Add(column);
        await db.SaveChangesAsync();

        return StatusCode(201, ToResponse(column));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Rename(int id, ColumnRequest request)
    {
        var column = await db.Columns.FindAsync(id);
        if (column is null) return NotFound(new { error = "Column not found" });

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        column.Name = request.Name.Trim();
        await db.SaveChangesAsync();

        return Ok(ToResponse(column));
    }

    [HttpPatch("{id}/order")]
    public async Task<IActionResult> Reorder(int id, ReorderRequest request)
    {
        var column = await db.Columns.FindAsync(id);
        if (column is null) return NotFound(new { error = "Column not found" });

        var target = await db.Columns.FirstOrDefaultAsync(c => c.Order == request.Order);
        if (target is not null && target.Id != id)
        {
            target.Order = column.Order;
        }

        column.Order = request.Order;
        await db.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var column = await db.Columns.FindAsync(id);
        if (column is null) return NotFound(new { error = "Column not found" });

        if (await db.Cards.AnyAsync(c => c.ColumnId == id))
            return Conflict(new { error = "Remova os cards antes de excluir a coluna" });

        db.Columns.Remove(column);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
