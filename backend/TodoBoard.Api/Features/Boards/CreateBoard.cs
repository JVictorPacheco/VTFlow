using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Boards;

public record BoardRequest(string Name, string? Description);
public record BoardResponse(int Id, string Name, string? Description, DateTime CreatedAt);

public static class CreateBoard
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/boards", async (BoardRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            if (await db.Boards.AnyAsync(b => b.Name == request.Name.Trim()))
                return Results.Conflict(new { error = "Board name already exists" });

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

            return Results.Created($"/boards/{board.Id}", new BoardResponse(board.Id, board.Name, board.Description, board.CreatedAt));
        }).RequireAuthorization();
}
