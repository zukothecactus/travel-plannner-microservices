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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Kaskadno brisanje: Korisnik -> Planovi putovanja
            // Pošto model Korisnik nema listu planova, koristimo WithMany() bez parametara
            modelBuilder.Entity<PlanPutovanja>()
                .HasOne<Korisnik>()
                .WithMany()
                .HasForeignKey(p => p.KorisnikId)
                .OnDelete(DeleteBehavior.Cascade);

            // 2. Kaskadno brisanje: Plan putovanja -> Destinacije
            // Povezujemo PlanPutovanja i njegovu kolekciju Destinacije
            modelBuilder.Entity<Destinacija>()
                .HasOne(d => d.PlanPutovanja)
                .WithMany(p => p.Destinacije)
                .HasForeignKey(d => d.PlanPutovanjaId)
                .OnDelete(DeleteBehavior.Cascade);

            // 3. Kaskadno brisanje: Plan putovanja -> Troskovi
            // Povezujemo PlanPutovanja i njegovu kolekciju Troskovi
            modelBuilder.Entity<Trosak>()
                .HasOne(t => t.PlanPutovanja)
                .WithMany(p => p.Troskovi)
                .HasForeignKey(t => t.PlanPutovanjaId)
                .OnDelete(DeleteBehavior.Cascade);

            // 4. Kaskadno brisanje: Plan putovanja -> ToDoStavke (Spisak)
            // ToDoStavka nema navigacioni property ka PlanPutovanja, pa koristimo HasOne<PlanPutovanja>()
            modelBuilder.Entity<ToDoStavka>()
                .HasOne<PlanPutovanja>()
                .WithMany(p => p.Spisak)
                .HasForeignKey(t => t.PlanPutovanjaId)
                .OnDelete(DeleteBehavior.Cascade);

            // 5. Kaskadno brisanje: Destinacija -> Aktivnosti
            // Povezujemo Destinaciju i njenu kolekciju Aktivnosti
            modelBuilder.Entity<Aktivnost>()
                .HasOne(a => a.Destinacija)
                .WithMany(d => d.Aktivnosti)
                .HasForeignKey(a => a.DestinacijaId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
