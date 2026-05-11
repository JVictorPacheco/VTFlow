using System.ComponentModel.DataAnnotations.Schema;

namespace TodoBoard.Api.Models;

[Table("Columns")]
public class Column
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;
}
