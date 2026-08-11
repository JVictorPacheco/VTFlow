using TodoBoard.Api.Features.Labels;

namespace TodoBoard.Api.Features.Cards;

public class CardLabel
{
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
    public int LabelId { get; set; }
    public Label Label { get; set; } = null!;
}
