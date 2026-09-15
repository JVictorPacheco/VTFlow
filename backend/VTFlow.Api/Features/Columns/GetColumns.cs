using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Columns;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Columns;

public static class GetColumns
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/columns", async (int? boardId, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            if (!boardId.HasValue)
                return Results.BadRequest(new { error = "boardId is required" });

            if (!await db.Boards.AnyAsync(b => b.Id == boardId.Value && (b.UserId == null || b.UserId == userId)))
                return Results.NotFound(new { error = "Board not found" });

            var columns = await db.Columns
                .Where(c => c.BoardId == boardId.Value && (c.UserId == null || c.UserId == userId))
                .OrderBy(c => c.Order)
                .ToListAsync();

            return Results.Ok(columns.Select(c => new ColumnResponse(c.Id, c.Name, c.Order, c.BoardId)));
        }).RequireAuthorization();
}
