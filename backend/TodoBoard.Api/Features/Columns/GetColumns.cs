using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Columns;

public static class GetColumns
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/columns", async (int? boardId, AppDbContext db) =>
        {
            if (!boardId.HasValue)
                return Results.BadRequest(new { error = "boardId is required" });

            if (!await db.Boards.AnyAsync(b => b.Id == boardId.Value))
                return Results.NotFound(new { error = "Board not found" });

            var columns = await db.Columns
                .Where(c => c.BoardId == boardId.Value)
                .OrderBy(c => c.Order)
                .ToListAsync();

            return Results.Ok(columns.Select(c => new ColumnResponse(c.Id, c.Name, c.Order, c.BoardId)));
        }).RequireAuthorization();
}
