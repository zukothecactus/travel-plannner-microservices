using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelDataService.Migrations
{
    /// <inheritdoc />
    public partial class InicijalnaBaza : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlanoviPutovanja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naziv = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DatumPocetka = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DatumZavrsetka = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlaniraniBudzet = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanoviPutovanja", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Destinacije",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NazivMesta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Napomena = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DatumDolaska = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DatumOdlaska = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlanPutovanjaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Destinacije", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Destinacije_PlanoviPutovanja_PlanPutovanjaId",
                        column: x => x.PlanPutovanjaId,
                        principalTable: "PlanoviPutovanja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Troskovi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Kategorija = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Iznos = table.Column<double>(type: "float", nullable: false),
                    Datum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlanPutovanjaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Troskovi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Troskovi_PlanoviPutovanja_PlanPutovanjaId",
                        column: x => x.PlanPutovanjaId,
                        principalTable: "PlanoviPutovanja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Aktivnosti",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naziv = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VremePocetka = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VremeZavrsetka = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DestinacijaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aktivnosti", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aktivnosti_Destinacije_DestinacijaId",
                        column: x => x.DestinacijaId,
                        principalTable: "Destinacije",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aktivnosti_DestinacijaId",
                table: "Aktivnosti",
                column: "DestinacijaId");

            migrationBuilder.CreateIndex(
                name: "IX_Destinacije_PlanPutovanjaId",
                table: "Destinacije",
                column: "PlanPutovanjaId");

            migrationBuilder.CreateIndex(
                name: "IX_Troskovi_PlanPutovanjaId",
                table: "Troskovi",
                column: "PlanPutovanjaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Aktivnosti");

            migrationBuilder.DropTable(
                name: "Troskovi");

            migrationBuilder.DropTable(
                name: "Destinacije");

            migrationBuilder.DropTable(
                name: "PlanoviPutovanja");
        }
    }
}
