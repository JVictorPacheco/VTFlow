using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Labels;

public static class DeleteLabel
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/labels/{id}", async (int id, AppDbContext db) =>
        {
            var label = await db.Labels.FindAsync(id);
            if (label is null) return Results.NotFound(new { error = "Label not found" });

            db.Labels.Remove(label);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization();
}
