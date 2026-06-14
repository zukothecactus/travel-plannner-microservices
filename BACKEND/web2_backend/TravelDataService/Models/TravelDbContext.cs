using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelPlanner.Interfaces.Models;

namespace TravelDataService.Models
{
    public class TravelDbContext : DbContext
    {
        // Definišemo tabele u bazi
        public DbSet<PlanPutovanja> PlanoviPutovanja { get; set; }
        public DbSet<Destinacija> Destinacije { get; set; }
        public DbSet<Aktivnost> Aktivnosti { get; set; }
        public DbSet<Trosak> Troskovi { get; set; }
        public DbSet<ToDoStavka> ToDoStavke { get; set; }
        public DbSet<Korisnik> Korisnici { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Povezujemo se na tvoj lokalni SQL Server (LocalDB)
                optionsBuilder.UseSqlServer(@"Server=.\SQLEXPRESS;Database=TravelPlanner_obren;Trusted_Connection=True;TrustServerCertificate=True;",
                    opcije => opcije.EnableRetryOnFailure()); // Omogućava automatsko ponavljanje u slučaju privremenih grešaka
            }
        }
    }
}
