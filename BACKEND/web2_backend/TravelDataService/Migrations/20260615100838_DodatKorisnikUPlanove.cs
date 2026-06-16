using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelDataService.Migrations
{
    /// <inheritdoc />
    public partial class DodatKorisnikUPlanove : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KorisnikId",
                table: "PlanoviPutovanja",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KorisnikId",
                table: "PlanoviPutovanja");
        }
    }
}
