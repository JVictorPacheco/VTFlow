using TodoBoard.Api.Features.Columns;

namespace TodoBoard.Api.Features.Boards;

public class Board
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Column> Columns { get; set; } = [];
}
