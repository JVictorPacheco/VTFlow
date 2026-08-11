using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Columns;

public record ColumnRequest(string Name, int BoardId);
public record ColumnResponse(int Id, string Name, int Order, int BoardId);
public record ReorderRequest(int Order);

public static class CreateColumn
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/columns", async (ColumnRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            if (!await db.Boards.AnyAsync(b => b.Id == request.BoardId))
                return Results.NotFound(new { error = "Board not found" });

            if (await db.Columns.AnyAsync(c => c.Name == request.Name && c.BoardId == request.BoardId))
                return Results.Conflict(new { error = "Column name already exists in this board" });

            var maxOrder = await db.Columns
                .Where(c => c.BoardId == request.BoardId)
                .AnyAsync()
                    ? await db.Columns.Where(c => c.BoardId == request.BoardId).MaxAsync(c => c.Order)
                    : 0;

            var column = new Column { Name = request.Name.Trim(), Order = maxOrder + 1, BoardId = request.BoardId };
            db.Columns.Add(column);
            await db.SaveChangesAsync();

            return Results.Created($"/columns/{column.Id}", new ColumnResponse(column.Id, column.Name, column.Order, column.BoardId));
        }).RequireAuthorization();
}
