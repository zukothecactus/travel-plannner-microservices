using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TravelDataService.Models;
using TravelPlanner.Interfaces;
using TravelPlanner.Interfaces.Models;
using Microsoft.EntityFrameworkCore;

namespace TravelDataService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class TravelDataService : StatelessService, ITravelDataService
    {
        public TravelDataService(StatelessServiceContext context)
            : base(context)
        { }


        public async Task<bool> AddPlanPutovanjaAsync(PlanPutovanja plan, int korisnikId)
        {
            using (var context = new TravelDbContext())
            {
                // Entity Framework sam prati stanje, samo dodamo objekat i sačuvamo
                plan.KorisnikId = korisnikId;
                context.PlanoviPutovanja.Add(plan);
                await context.SaveChangesAsync();
                return true;
            }
        }


        public async Task<List<PlanPutovanja>> GetPlanoviPutovanjaAsync(int korisnikId)
        {
            using (var context = new TravelDbContext())
            {
                // Vraćamo sve planove kao listu
                return await context.PlanoviPutovanja.Where(p => p.KorisnikId == korisnikId).ToListAsync();
            }
        }

        public async Task<PlanPutovanja> GetPlanPutovanjaSaDetaljimaAsync(int planId)
        {
            using (var context = new TravelDbContext())
            {
                return await context.PlanoviPutovanja.Include(p => p.Destinacije).ThenInclude(d => d.Aktivnosti)
                    .Include(p => p.Troskovi)
                    .Include(p => p.Spisak)
                    .FirstOrDefaultAsync(p => p.Id == planId);


            }
        }
        public async Task<bool> AddDestinacijaAsync(Destinacija destinacija)
        {
            using (var context = new TravelDbContext())
            {
                context.Destinacije.Add(destinacija);
                await context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<bool> AddTrosakAsync(Trosak trosak)
        {
            using( var context = new TravelDbContext())
            {
                context.Troskovi.Add(trosak);
                await context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<bool> ObrisiPlanPutovanjaAsync(int id)
        {
            using (var context = new TravelDbContext())
            {
                var plan = await context.PlanoviPutovanja.FindAsync(id);
                if (plan != null)
                {
                    context.PlanoviPutovanja.Remove(plan);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> ObrisiTrosakAsync(int id)
        {
            using (var context = new TravelDbContext())
            {
                var trosak = await context.Troskovi.FindAsync(id);
                if (trosak != null)
                {
                    context.Troskovi.Remove(trosak);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> DodajToDoStavkuAsync(ToDoStavka stavka)
        {             
            using (var context = new TravelDbContext())
            {
                context.ToDoStavke.Add(stavka);
                await context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<bool> PromeniStatusStavkeAsync(int id)
        {
            using (var context = new TravelDbContext())
            {
                var stavka = context.ToDoStavke.Find(id);
                if (stavka != null)
                {
                    stavka.JeZavrseno = !stavka.JeZavrseno; // Menjamo status
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> ObrisiToDoStavkuAsync(int id)
        {
            using (var context = new TravelDbContext())
            {
                var stavka = await context.ToDoStavke.FindAsync(id);
                if (stavka != null)
                {
                    context.ToDoStavke.Remove(stavka);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> RegistrujKorisnikaAsync(RegistracijaDto podaci)
        {
            using (var context = new TravelDbContext())
            {
                // 1. Backend validacija: Da li email već postoji u bazi?
                var emailPostoji = await context.Korisnici.AnyAsync(k => k.Email == podaci.Email);
                if (emailPostoji)
                {
                    return false; // Prekidamo ako korisnik sa ovim emailom već postoji
                }

                // 2. Kreiranje novog korisnika i heširanje lozinke
                var noviKorisnik = new Korisnik
                {
                    Ime = podaci.Ime,
                    Email = podaci.Email,
                    // BCrypt automatski generiše i 'salt' i heš
                    LozinkaHash = BCrypt.Net.BCrypt.HashPassword(podaci.Lozinka),
                    Uloga = "KORISNIK" // Default uloga za svakog novog člana
                };

                // 3. Čuvanje u bazi
                context.Korisnici.Add(noviKorisnik);
                await context.SaveChangesAsync();

                return true;
            }
        }

        public async Task<KorisnikInfo> ProverKredencijalAsync(PrijavaDto podaci)
        {
            using (var context = new TravelDbContext())
            {
                var korisnik = await context.Korisnici.FirstOrDefaultAsync(k => k.Email == podaci.Email);

                if (korisnik == null) return null;

                //lozinka check
                bool lozinkaValidna = BCrypt.Net.BCrypt.Verify(podaci.Lozinka, korisnik.LozinkaHash);

                if (!lozinkaValidna) return null;

                return new KorisnikInfo
                {
                    Id = korisnik.Id,
                    Ime = korisnik.Ime,
                    Email = korisnik.Email,
                    Uloga = korisnik.Uloga
                };
            }
        }

        public async Task<List<KorisnikInfo>> DobaviSveKorisnikeAsync()
        {
            using (var context = new TravelDbContext())
            {
                return await context.Korisnici
                    .Select(k => new KorisnikInfo //bukv samo dto za podatke, nego ga nsm lep nazvao xd
                    {
                        Id = k.Id,
                        Ime = k.Ime,
                        Email = k.Email,
                        Uloga = k.Uloga
                    })
                    .ToListAsync();
            }
        }
        public async Task<bool> ObrisiKorisnikaAsync(int korisnikId)
        {
            using (var context = new TravelDbContext())
            {
                var korisnik = await context.Korisnici.FindAsync(korisnikId);
                if (korisnik != null && korisnik.Id != 1) // nikako ne brisemo glavnog admina
                {
                    context.Korisnici.Remove(korisnik);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<double> DobaviSumuTroskovaZaPlanAsync(int planId)
        {
            using (var context = new TravelDbContext())
            {
                // Direktno iz baze uzimamo samo sumu, što je ultra brzo i bezbedno za serijalizaciju
                return await context.Troskovi
                    .Where(t => t.PlanPutovanjaId == planId)
                    .SumAsync(t => t.Iznos);
            }
        }

        public async Task<bool> ObrisiDestinacijuAsync(int destinacijaId)
        {
            using (var context = new TravelDbContext())
            {
                var destinacija = await context.Destinacije.FindAsync(destinacijaId);
                if (destinacija != null)
                {
                    context.Destinacije.Remove(destinacija);
                    await context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> AzurirajPlanPutovanjaAsync(PlanPutovanja izmenjeniPlan)
        {
            using (var context = new TravelDbContext())
            {
                var postojeciPlan = await context.PlanoviPutovanja.FindAsync(izmenjeniPlan.Id);
                if (postojeciPlan == null) return false;

                // Menjamo samo dozvoljena polja
                postojeciPlan.Naziv = izmenjeniPlan.Naziv;
                postojeciPlan.Opis = izmenjeniPlan.Opis;
                postojeciPlan.PlaniraniBudzet = izmenjeniPlan.PlaniraniBudzet;

                await context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<bool> AzurirajDestinacijuAsync(Destinacija izmenjenaDestinacija)
        {
            using (var context = new TravelDbContext())
            {
                var postojecaDestinacija = await context.Destinacije.FindAsync(izmenjenaDestinacija.Id);
                if (postojecaDestinacija == null) return false;

                postojecaDestinacija.NazivMesta = izmenjenaDestinacija.NazivMesta;
                postojecaDestinacija.Napomena = izmenjenaDestinacija.Napomena;
                postojecaDestinacija.DatumDolaska = izmenjenaDestinacija.DatumDolaska;
                postojecaDestinacija.DatumOdlaska = izmenjenaDestinacija.DatumOdlaska;

                await context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<bool> AzurirajTrosakAsync(Trosak izmenjeniTrosak)
        {
            using (var context = new TravelDbContext())
            {
                var postojeciTrosak = await context.Troskovi.FindAsync(izmenjeniTrosak.Id);
                if (postojeciTrosak == null) return false;

                postojeciTrosak.Kategorija = izmenjeniTrosak.Kategorija;
                postojeciTrosak.Opis = izmenjeniTrosak.Opis;
                postojeciTrosak.Iznos = izmenjeniTrosak.Iznos;
                postojeciTrosak.Datum = izmenjeniTrosak.Datum;

                await context.SaveChangesAsync();
                return true;
            }
        }

        public Task<string> PingAsync()
        {
            return Task.FromResult("Pozdrav od TravelData servisa! Remoting radi besprekorno.");
        }

        /// <summary>
        /// Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        /// <summary>
        /// This is the main entry point for your service instance.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service instance.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ServiceEventSource.Current.ServiceMessage(this.Context, "Working-{0}", ++iterations);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

    }
}
