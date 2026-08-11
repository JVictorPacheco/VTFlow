using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Labels;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Labels;

public static class GetLabels
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/labels", async (AppDbContext db) =>
        {
            var labels = await db.Labels.OrderBy(l => l.Name).ToListAsync();
            return Results.Ok(labels);
        }).RequireAuthorization();
}
