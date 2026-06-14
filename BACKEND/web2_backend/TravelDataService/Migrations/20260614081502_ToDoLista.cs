using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelDataService.Migrations
{
    /// <inheritdoc />
    public partial class ToDoLista : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ToDoStavke",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tekst = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JeZavrseno = table.Column<bool>(type: "bit", nullable: false),
                    PlanPutovanjaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToDoStavke", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ToDoStavke_PlanoviPutovanja_PlanPutovanjaId",
                        column: x => x.PlanPutovanjaId,
                        principalTable: "PlanoviPutovanja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ToDoStavke_PlanPutovanjaId",
                table: "ToDoStavke",
                column: "PlanPutovanjaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ToDoStavke");
        }
    }
}
