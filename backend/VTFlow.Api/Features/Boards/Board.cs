using VTFlow.Api.Features.Columns;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Features.Boards;

public class Board
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? UserId { get; set; }
    public User? User { get; set; }
    public ICollection<Column> Columns { get; set; } = [];
}
