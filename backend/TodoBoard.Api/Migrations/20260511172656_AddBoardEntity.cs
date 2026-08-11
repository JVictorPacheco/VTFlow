using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoBoard.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Criar tabela Boards primeiro
            migrationBuilder.CreateTable(
                name: "Boards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boards", x => x.Id);
                });

            // 2. Inserir board padrão para receber as colunas existentes
            migrationBuilder.Sql(
                "INSERT INTO Boards (Name, Description, CreatedAt) VALUES ('Meu Board', NULL, datetime('now'))");

            // 3. Adicionar coluna BoardId com default 0 (temporário)
            migrationBuilder.AddColumn<int>(
                name: "BoardId",
                table: "Columns",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // 4. Atribuir todas as colunas existentes ao board padrão recém-criado
            migrationBuilder.Sql(
                "UPDATE Columns SET BoardId = (SELECT Id FROM Boards LIMIT 1)");

            migrationBuilder.CreateIndex(
                name: "IX_Columns_BoardId",
                table: "Columns",
                column: "BoardId");

            migrationBuilder.AddForeignKey(
                name: "FK_Columns_Boards_BoardId",
                table: "Columns",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Columns_Boards_BoardId",
                table: "Columns");

            migrationBuilder.DropTable(
                name: "Boards");

            migrationBuilder.DropIndex(
                name: "IX_Columns_BoardId",
                table: "Columns");

            migrationBuilder.DropColumn(
                name: "BoardId",
                table: "Columns");
        }
    }
}
