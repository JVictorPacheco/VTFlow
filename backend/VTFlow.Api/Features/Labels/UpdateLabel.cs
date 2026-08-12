using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Labels;

public partial class UpdateLabel
{
    [GeneratedRegex(@"^#[0-9A-Fa-f]{6}$")]
    private static partial Regex HexColorRegex();

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/labels/{id}", async (int id, LabelRequest request, AppDbContext db) =>
        {
            var label = await db.Labels.FindAsync(id);
            if (label is null) return Results.NotFound(new { error = "Label not found" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            if (!HexColorRegex().IsMatch(request.Color))
                return Results.BadRequest(new { error = "Color must be a valid hex color" });

            label.Name = request.Name.Trim();
            label.Color = request.Color;
            await db.SaveChangesAsync();

            return Results.Ok(label);
        }).RequireAuthorization();
}
