using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Features.Columns;

namespace TodoBoard.Api.Shared;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public ICollection<Board> Boards { get; set; } = [];
    public ICollection<Column> Columns { get; set; } = [];
    public ICollection<Card> Cards { get; set; } = [];
}
