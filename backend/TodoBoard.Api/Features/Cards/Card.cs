using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Cards;

public class Card
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public int ColumnId { get; set; }
    public int Order { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? UserId { get; set; }
    public ICollection<CardLabel> CardLabels { get; set; } = [];
    public ICollection<Subtask> Subtasks { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<CardActivity> Activities { get; set; } = [];
}
