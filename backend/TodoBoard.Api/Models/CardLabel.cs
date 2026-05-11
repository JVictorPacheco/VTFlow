namespace TodoBoard.Api.Models;

public class CardLabel
{
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
    public int LabelId { get; set; }
    public Label Label { get; set; } = null!;
}
