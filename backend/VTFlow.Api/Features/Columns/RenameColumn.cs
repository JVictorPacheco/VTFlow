using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Columns;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Columns;

public static class RenameColumn
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/columns/{id}", async (int id, ColumnRequest request, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            var column = await db.Columns.FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));
            if (column is null) return Results.NotFound(new { error = "Column not found" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            column.Name = request.Name.Trim();
            await db.SaveChangesAsync();

            return Results.Ok(new ColumnResponse(column.Id, column.Name, column.Order, column.BoardId));
        }).RequireAuthorization();
}
