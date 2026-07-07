using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelDataService.Migrations
{
    /// <inheritdoc />
    public partial class DodatoKaskadnoBrisanje : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_PlanoviPutovanja_KorisnikId",
                table: "PlanoviPutovanja",
                column: "KorisnikId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanoviPutovanja_Korisnici_KorisnikId",
                table: "PlanoviPutovanja",
                column: "KorisnikId",
                principalTable: "Korisnici",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanoviPutovanja_Korisnici_KorisnikId",
                table: "PlanoviPutovanja");

            migrationBuilder.DropIndex(
                name: "IX_PlanoviPutovanja_KorisnikId",
                table: "PlanoviPutovanja");
        }
    }
}
