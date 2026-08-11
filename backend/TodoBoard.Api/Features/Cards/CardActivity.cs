using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public class CardActivity
{
    public int Id { get; set; }
    public ActivityType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
}
