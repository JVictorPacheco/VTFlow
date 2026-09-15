namespace VTFlow.Api.Features.Cards;

public class Subtask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
}
