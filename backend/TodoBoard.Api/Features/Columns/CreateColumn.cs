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
        app.MapPost("/columns", async (ColumnRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            if (!await db.Boards.AnyAsync(b => b.Id == request.BoardId && (b.UserId == null || b.UserId == userId)))
                return Results.NotFound(new { error = "Board not found" });

            if (await db.Columns.AnyAsync(c => c.Name == request.Name && c.BoardId == request.BoardId && (c.UserId == null || c.UserId == userId)))
                return Results.Conflict(new { error = "Column name already exists in this board" });

            var maxOrder = await db.Columns
                .Where(c => c.BoardId == request.BoardId && (c.UserId == null || c.UserId == userId))
                .AnyAsync()
                    ? await db.Columns.Where(c => c.BoardId == request.BoardId && (c.UserId == null || c.UserId == userId)).MaxAsync(c => c.Order)
                    : 0;

            var column = new Column { Name = request.Name.Trim(), Order = maxOrder + 1, BoardId = request.BoardId, UserId = userId };
            db.Columns.Add(column);
            await db.SaveChangesAsync();

            return Results.Created($"/columns/{column.Id}", new ColumnResponse(column.Id, column.Name, column.Order, column.BoardId));
        }).RequireAuthorization();
}
