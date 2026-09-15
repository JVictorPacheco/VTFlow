using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Cards;

public static partial class DuplicateCard
{
    [GeneratedRegex(@"^(?<base>.+) \(cópia(?: (?<number>\d+))?\)$")]
    private static partial Regex CopySuffixRegex();

    // RN01: "X" -> "X (cópia)" -> "X (cópia 2)" -> "X (cópia 3)"...
    private static string BuildCopyTitle(string title)
    {
        var match = CopySuffixRegex().Match(title);
        if (!match.Success)
            return $"{title} (cópia)";

        var baseTitle = match.Groups["base"].Value;
        var nextNumber = match.Groups["number"].Success ? int.Parse(match.Groups["number"].Value) + 1 : 2;
        return $"{baseTitle} (cópia {nextNumber})";
    }

    private static CardResponse ToResponse(Card card) => new(
        card.Id, card.Title, card.Description, card.DueDate, card.Priority, card.ColumnId, card.CreatedAt, card.Order,
        card.CardLabels.Select(cl => new LabelDto(cl.Label.Id, cl.Label.Name, cl.Label.Color)).ToList(),
        card.Subtasks.OrderBy(s => s.Id).Select(s => new SubtaskDto(s.Id, s.Title, s.IsCompleted)).ToList()
    );

    private static void LogActivity(AppDbContext db, int cardId, ActivityType type, string description) =>
        db.CardActivities.Add(new CardActivity { CardId = cardId, Type = type, Description = description, CreatedAt = DateTime.UtcNow });

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/cards/{id}/duplicate", async (int id, AppDbContext db, HttpContext context) =>
        {
            var userId = UserContext.GetUserId(context);

            // 1. Busca o card original (com etiquetas), respeitando multi-tenancy
            var original = await db.Cards
                .Include(c => c.CardLabels).ThenInclude(cl => cl.Label)
                .FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));

            if (original is null)
                return Results.NotFound(new { error = "Card not found" });

            // 2. Calcula a ordem (fim da coluna), igual ao CreateCard
            var maxOrder = await db.Cards
                .Where(c => c.ColumnId == original.ColumnId && (c.UserId == null || c.UserId == userId))
                .Select(c => (int?)c.Order).MaxAsync() ?? -1;

            // 3. Cria a cópia (sem subtarefas e comentários)
            var copy = new Card
            {
                Title = BuildCopyTitle(original.Title),
                Description = original.Description,
                DueDate = original.DueDate,
                Priority = original.Priority,
                ColumnId = original.ColumnId,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                Order = maxOrder + 1
            };

            db.Cards.Add(copy);
            await db.SaveChangesAsync();

            // 4. Copia as etiquetas (RN03)
            if (original.CardLabels.Count > 0)
                db.CardLabels.AddRange(original.CardLabels.Select(cl => new CardLabel { CardId = copy.Id, LabelId = cl.LabelId }));

            // 5. Rastreabilidade (RF02): atividade no card novo e no original
            LogActivity(db, copy.Id, ActivityType.CardCreated, "Card criado por duplicação.");
            LogActivity(db, original.Id, ActivityType.CardDuplicated, "Este card foi duplicado.");

            await db.SaveChangesAsync();

            await db.Entry(copy).Collection(c => c.CardLabels).Query().Include(cl => cl.Label).LoadAsync();
            await db.Entry(copy).Collection(c => c.Subtasks).LoadAsync();

            return Results.Created($"/cards/{copy.Id}", ToResponse(copy));
        }).RequireAuthorization();
}
