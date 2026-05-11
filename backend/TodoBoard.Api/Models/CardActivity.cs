namespace TodoBoard.Api.Models;

public enum ActivityType
{
    CardCreated,
    CardMoved,
    PriorityChanged,
    LabelAdded,
    LabelRemoved,
    SubtaskAdded,
    SubtaskCompleted,
    SubtaskReopened,
    SubtaskRenamed,
    SubtaskDeleted,
    CommentAdded,
    CommentDeleted
}

public class CardActivity
{
    public int Id { get; set; }
    public ActivityType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
}
