using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Data;
using TodoBoard.Api.Models;

namespace TodoBoard.Api.Controllers;

public record BoardRequest(string Name, string? Description);

public record BoardResponse(int Id, string Name, string? Description, DateTime CreatedAt);

[ApiController]
[Route("boards")]
[Authorize]
public class BoardsController(AppDbContext db) : ControllerBase
{
    private static BoardResponse ToResponse(Board b) =>
        new(b.Id, b.Name, b.Description, b.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var boards = await db.Boards
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(boards.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var board = await db.Boards.FindAsync(id);
        if (board is null) return NotFound(new { error = "Board not found" });

        return Ok(ToResponse(board));
    }

    [HttpPost]
    public async Task<IActionResult> Create(BoardRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        if (await db.Boards.AnyAsync(b => b.Name == request.Name.Trim()))
            return Conflict(new { error = "Board name already exists" });

        var board = new Board
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        db.Boards.Add(board);
        await db.SaveChangesAsync();

        db.Columns.AddRange(
            new Column { Name = "A Fazer", Order = 1, BoardId = board.Id },
            new Column { Name = "Em Andamento", Order = 2, BoardId = board.Id },
            new Column { Name = "Concluído", Order = 3, BoardId = board.Id }
        );

        await db.SaveChangesAsync();

        return StatusCode(201, ToResponse(board));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, BoardRequest request)
    {
        var board = await db.Boards.FindAsync(id);
        if (board is null) return NotFound(new { error = "Board not found" });

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required" });

        board.Name = request.Name.Trim();
        board.Description = request.Description;
        await db.SaveChangesAsync();

        return Ok(ToResponse(board));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var board = await db.Boards.FindAsync(id);
        if (board is null) return NotFound(new { error = "Board not found" });

        db.Boards.Remove(board);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
