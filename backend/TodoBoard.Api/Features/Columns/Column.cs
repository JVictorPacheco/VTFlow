using System.ComponentModel.DataAnnotations.Schema;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Shared;

namespace TodoBoard.Api.Features.Columns;

[Table("Columns")]
public class Column
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public int? UserId { get; set; }
    public User? User { get; set; }
}
