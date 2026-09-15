using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Labels;

public static class GetLabels
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/labels", async (AppDbContext db) =>
        {
            var labels = await db.Labels.OrderBy(l => l.Name).ToListAsync();
            return Results.Ok(labels);
        }).RequireAuthorization();
}
