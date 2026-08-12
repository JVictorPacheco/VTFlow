using VTFlow.Api.Features.Boards;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Features.Columns;

namespace VTFlow.Api.Shared;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public ICollection<Board> Boards { get; set; } = [];
    public ICollection<Column> Columns { get; set; } = [];
    public ICollection<Card> Cards { get; set; } = [];
}
