using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TodoBoard.Api.Features.Labels;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Labels;

public record LabelRequest(string Name, string Color);

public static partial class CreateLabel
{
    [GeneratedRegex(@"^#[0-9A-Fa-f]{6}$")]
    private static partial Regex HexColorRegex();

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/labels", async (LabelRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            if (!HexColorRegex().IsMatch(request.Color))
                return Results.BadRequest(new { error = "Color must be a valid hex color (e.g. #FF5733)" });

            if (await db.Labels.AnyAsync(l => l.Name == request.Name))
                return Results.Conflict(new { error = "Label name already exists" });

            var label = new Label { Name = request.Name.Trim(), Color = request.Color };
            db.Labels.Add(label);
            await db.SaveChangesAsync();

            return Results.Created($"/labels/{label.Id}", label);
        }).RequireAuthorization();
}
