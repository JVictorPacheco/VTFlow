using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoBoard.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncNamespacesAfterVerticalSlice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cards_Columns_ColumnId",
                table: "Cards");

            migrationBuilder.DropIndex(
                name: "IX_Cards_ColumnId",
                table: "Cards");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Cards_ColumnId",
                table: "Cards",
                column: "ColumnId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_Columns_ColumnId",
                table: "Cards",
                column: "ColumnId",
                principalTable: "Columns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
