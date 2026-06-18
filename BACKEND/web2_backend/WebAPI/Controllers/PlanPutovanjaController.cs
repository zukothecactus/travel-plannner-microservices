using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Interfaces;
using TravelPlanner.Interfaces.Models;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;


namespace WebAPI.Controllers
{
    [Authorize] //zakljucavamo sve rute u ovom kontroleru, tako da je potrebno da korisnik bude autentifikovan da bi pristupio bilo kojoj od njih
    [Route("api/[controller]")]
    [ApiController]
    public class PlanPutovanjaController : ControllerBase
    {
        private readonly ITravelDataService _travelDataServiceProxy;

        public PlanPutovanjaController()
        {
            // Odmah u konstruktoru kreiramo proxy za komunikaciju sa našim backend servisom
            _travelDataServiceProxy = ServiceProxy.Create<ITravelDataService>(
                new Uri("fabric:/TravelPlannerApp/TravelDataService"));
        
           // _budgetServiceProxy = ServiceProxy.Create<ISharingAndBudgetService>( new Uri("fabric:/TravelPlannerApp/SharingAndBudgetService"),
       // new ServicePartitionKey(0)); //kad radimo sa stateful servisima, moramo da navedemo i ključ particije, ovde pretpostavljamo da imamo samo jednu particiju, pa je kljuc 1

        }

        private int DobaviIdUlogovanogKorisnika()
        {
            var idString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return int.Parse(idString);
        }

        [HttpPost]
        public async Task<IActionResult> DodajNoviPlan([FromBody] PlanPutovanja plan)
        {
            try
            {
                var korisnikId = DobaviIdUlogovanogKorisnika();
                // Pozivamo tvoju novu metodu
                var uspesno = await _travelDataServiceProxy.AddPlanPutovanjaAsync(plan, korisnikId);

                if (uspesno)
                    return Ok("Plan putovanja je uspešno sačuvan u bazu!");

                return BadRequest("Došlo je do greške pri čuvanju.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri komunikaciji sa bazom: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> PreuzmiSvePlanove()
        {
            try
            {
                var korisnikId = DobaviIdUlogovanogKorisnika();
                // Pozivamo tvoju novu metodu za dobavljanje
                var planovi = await _travelDataServiceProxy.GetPlanoviPutovanjaAsync(korisnikId);
                return Ok(planovi);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri preuzimanju podataka: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> PreuzmiPlanSaDetaljima(int id)
        {
            try
            {
                var plan = await _travelDataServiceProxy.GetPlanPutovanjaSaDetaljimaAsync(id);
                if (plan == null)
                {
                    return NotFound("Plan putovanja sa trazenim ID-jem nije pronadjen");
                }
                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri preuzimanju detalja: {ex.Message}");
            }
        }

        [HttpPost("destinacija")]
        public async Task<IActionResult> DodajDestinaciju([FromBody] Destinacija destinacija)
        {
            try
            {
                var uspesno = await _travelDataServiceProxy.AddDestinacijaAsync(destinacija);
                if (uspesno) return Ok("Destinacija je uspešno dodata!");
                return BadRequest("Greška pri dodavanju destinacije.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");
            }
        }




        /*
         * Primer JSON-a
{
    "kategorija": "Smeštaj",
    "opis": "Apartman blizu mora",
    "iznos": 450.50,
    "datum": "2026-06-01T12:00:00.000Z",
    "planPutovanjaId": 1
}
         * 
         */
        [HttpPost("trosak")]
        public async Task<IActionResult> DodajTrosak([FromBody] Trosak trosak)
        {
            try
            {
                //cuvamo trajno u bazi
                var uspesno = await _travelDataServiceProxy.AddTrosakAsync(trosak);

                if (uspesno)
                {
                    //ovo postoji kako bismo gadjali dobru particiju stateful servisa, jer svaki trosak ima svoj PlanPutovanjaId, a mi u SharingAndBudgetServiceu koristimo taj ID kao ključ particije, tako da ćemo ga iskoristiti i ovde da pogodimo pravu particiju
                    var budgetProxy = ServiceProxy.Create<IBudgetService>(
                new Uri("fabric:/TravelPlannerApp/BudgetService"),
                new ServicePartitionKey(trosak.PlanPutovanjaId));
                    

                    var trenutniBudzet = await budgetProxy.DodajTrosakUBudzetAsync(trosak.PlanPutovanjaId, trosak.Iznos);

                    return Ok($"Trošak evidentiran za Plan ID: {trosak.PlanPutovanjaId}! Trenutni budžet: {trenutniBudzet}");
                }
                return BadRequest("Greška pri dodavanju troška.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");
            }
        }

        [HttpGet("{id}/potrosnja")]
        public async Task<IActionResult> DobaviTrenutnuPotrosnju([FromRoute]int id)
        {
            //[FromRoute] - eksplicitno naglašavamo da id dolazi iz URL-a, iako bi ASP.NET Core to i sam zaključio
            try
            {
                // Pravimo proxy koji ponovo gađa ISTU TAČNU particiju
                var budgetProxy = ServiceProxy.Create<IBudgetService>(
                    new Uri("fabric:/TravelPlannerApp/BudgetService"),
                    new ServicePartitionKey(id));

                var ukupno = await budgetProxy.DobaviUkupnuPotrosnjuAsync(id);

                // Vraćamo jednostavan JSON objekat umesto običnog teksta, biće nam zgodnije za React kasnije
                return Ok(new { planPutovanjaId = id, ukupnaPotrosnja = ukupno });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri komunikaciji sa Stateful servisom: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ObrisiPlan(int id)
        {
            var uspesno = await _travelDataServiceProxy.ObrisiPlanPutovanjaAsync(id);
            if (uspesno) return Ok("Plan putovanja je uspešno obrisan.");
            return NotFound("Plan putovanja nije pronađen.");
        }

        [HttpDelete("trosak/{id}")]
        public async Task<IActionResult> ObrisiTrosak(int id, [FromQuery] int planId, [FromQuery] double iznos)
        {
            try
            {
                var uspesno = await _travelDataServiceProxy.ObrisiTrosakAsync(id);
                if (uspesno)
                {
                    // Sinhronizacija sa Stateful servisom - oduzimamo obrisani iznos!
                    var budgetProxy = ServiceProxy.Create<IBudgetService>(
                        new Uri("fabric:/TravelPlannerApp/BudgetService"),
                        new ServicePartitionKey(planId));

                    // Prosleđujemo negativnu vrednost
                    await budgetProxy.DodajTrosakUBudzetAsync(planId, -iznos);

                    return Ok("Trošak je obrisan i budžet u memoriji je ažuriran.");
                }
                return BadRequest("Greška pri brisanju troška iz baze.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška: {ex.Message}");
            }
        }

        [HttpPost("todo")]
        public async Task<IActionResult> DodajToDo([FromBody] ToDoStavka stavka)
        {
                       try
            {
                var uspesno = await _travelDataServiceProxy.DodajToDoStavkuAsync(stavka);
                if (uspesno) return Ok("ToDo stavka je uspešno dodata!");
                return BadRequest("Greška pri dodavanju ToDo stavke.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");
            }
        }

        [HttpPut("todo/{id}/toggle")]
        public async Task<IActionResult> ToggleToDo(int id)
        {
            try
            {
                var uspesno = await _travelDataServiceProxy.PromeniStatusStavkeAsync(id);
                if (uspesno) return Ok("Status ToDo stavke je uspešno promenjen!");
                return BadRequest("Greška pri promeni statusa ToDo stavke.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");
            }
        }

        [HttpDelete("todo/{id}")]
        public async Task<IActionResult> ObrisiToDo(int id)
        {
            try
            {
                var uspesno = await _travelDataServiceProxy.ObrisiToDoStavkuAsync(id);
                if (uspesno) return Ok("ToDo stavka je uspešno obrisana!");
                return BadRequest("Greška pri brisanju ToDo stavke.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");
            }
        }

        [HttpPost("{id}/generisi-token")]
        public async Task<IActionResult> GenerisiTokenZaDeljenje(int id, [FromBody] ZahtevZaDeljenje zahtev)
        {
            try
            {

                int ulogovaniKorisnikId = DobaviIdUlogovanogKorisnika();
                var plan = await _travelDataServiceProxy.GetPlanPutovanjaSaDetaljimaAsync(ulogovaniKorisnikId);
                if (plan == null) return Forbid("Plan putovanja nije pronađen ili nemate pristup.");

                if (zahtev.NivoPristupa != "VIEW" && zahtev.NivoPristupa != "EDIT")
                {
                    return BadRequest("Nivo pristupa mora biti 'VIEW' ili 'EDIT'.");
                }

                //token samo za deljenje
                var tajniKljuc = "OvoJeTajniKljucZaGenerisanjeTokenaKojiTrebaDaBudeDugacakMinimum32Karaktera"; // ne bi trebalo da se hardkoduje, ali za primer je ok
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tajniKljuc));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim("PlanId", id.ToString()),
                    new Claim("NivoPristupa", zahtev.NivoPristupa),
                    new Claim("TipTokena", "DeljenjePlana") // Dodatna zaštita da se osigura namena tokena
                };

                var token = new JwtSecurityToken(
                    issuer: "TravelPlannerBackend",
                    audience: "TravelPlannerFrontend",
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(zahtev.TrajanjeUMinutima),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new { Token = tokenString });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri generisanju tokena: {ex.Message}");
            }
        }

        [AllowAnonymous] // Omogućavamo pristup bez autentifikacije, jer korisnik može da dobije token od nekog ko je već ulogovan
        [HttpGet("validiraj-deljenje/{token}")]
        public async Task<IActionResult> ValidirajTokenZaDeljenje(string token)
        {
            try
            {
                var tajniKljuc = "OvoJeTajniKljucZaGenerisanjeTokenaKojiTrebaDaBudeDugacakMinimum32Karaktera";
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(tajniKljuc);

                // Konfiguracija parametara za validaciju tokena
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = "TravelPlannerBackend",
                    ValidateAudience = true,
                    ValidAudience = "TravelPlannerFrontend",
                    ValidateLifetime = true, // automatski proverava da li je trajanje linka isteklo
                    ClockSkew = TimeSpan.Zero
                };

                // Validacija i čitanje claim-ova
                SecurityToken validiraniToken;
                var principal = tokenHandler.ValidateToken(token, validationParameters, out validiraniToken);

                var tipTokenaClaim = principal.FindFirst("TipTokena")?.Value;
                if (tipTokenaClaim != "DeljenjePlana")
                {
                    return BadRequest("Neispravan tip tokena.");
                }

                var planIdStr = principal.FindFirst("PlanId")?.Value;
                var nivoPristupa = principal.FindFirst("NivoPristupa")?.Value;

                if (string.IsNullOrEmpty(planIdStr) || string.IsNullOrEmpty(nivoPristupa))
                {
                    return BadRequest("Token ne sadrži sve potrebne informacije.");
                }

                int planId = int.Parse(planIdStr);

                // Pozivamo proverenu metodu koja povlači specifičan plan sa svim detaljima
                var plan = await _travelDataServiceProxy.GetPlanPutovanjaSaDetaljimaAsync(planId);

                if (plan == null)
                {
                    return NotFound("Plan putovanja više ne postoji.");
                }

                // Vraćamo ceo plan i nivo pristupa na frontend kako bi se odmah prikazali podaci
                return Ok(new
                {
                    Plan = plan,
                    NivoPristupa = nivoPristupa,
                    Poruka = "Token je validan."
                });
            }
            catch (SecurityTokenExpiredException)
            {
                return BadRequest("Ovaj link za deljenje je istekao.");
            }
            catch (Exception)
            {
                return BadRequest("Neispravan ili modifikovan token za deljenje.");
            }
        }

        [HttpDelete("destinacija/{id}")]
        public async Task<IActionResult> ObrisiDestinaciju(int id)
        {
            try
            {
                var uspesno = await _travelDataServiceProxy.ObrisiDestinacijuAsync(id);
                if (uspesno)
                {
                    return Ok(new { Poruka = "Destinacija je uspešno obrisana.", DestinacijaId = id });
                }
                return BadRequest("Greska pri brisanju destinacije.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška servera: {ex.Message}");

            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> IzmeniPlan(int id, [FromBody] PlanPutovanja plan)
        {
            if (id != plan.Id) return BadRequest("ID plana se ne poklapa.");

            var uspesno = await _travelDataServiceProxy.AzurirajPlanPutovanjaAsync(plan);
            if (uspesno)
            {
                return Ok(new { Poruka = "Plan putovanja uspešno izmenjen." });
            }
            return BadRequest("Greška prilikom izmene plana.");
        }

        [HttpPut("destinacija/{id}")]
        public async Task<IActionResult> IzmeniDestinaciju(int id, [FromBody] Destinacija destinacija)
        {
            if (id != destinacija.Id) return BadRequest("ID destinacije se ne poklapa.");

            var uspesno = await _travelDataServiceProxy.AzurirajDestinacijuAsync(destinacija);
            if (uspesno)
            {
                return Ok(new { Poruka = "Destinacija uspešno izmenjena." });
            }
            return BadRequest("Greška prilikom izmene destinacije.");
        }

        [HttpPut("trosak/{id}")]
        public async Task<IActionResult> IzmeniTrosak(int id, [FromBody] Trosak trosak)
        {
            if (id != trosak.Id) return BadRequest("ID troška se ne poklapa.");

            var uspesno = await _travelDataServiceProxy.AzurirajTrosakAsync(trosak);
            if (uspesno)
            {
                // VAŽNO: Pozivamo Stateful servis da obriše stari keš budžeta za ovaj plan
                // Ovde pozovi proxy svog SharingAndBudgetService-a:
                // await _budgetServiceProxy.InvalidirajKešBudžetaAsync(trosak.PlanPutovanjaId);

                return Ok(new { Poruka = "Trošak uspešno izmenjen." });
            }
            return BadRequest("Greška prilikom izmene troška.");
        }

        [HttpPost("aktivnost")]
        public async Task<IActionResult> DodajAktivnost([FromBody] Aktivnost aktivnost)
        {
            var uspesno = await _travelDataServiceProxy.DodajAktivnostAsync(aktivnost);
            return uspesno ? Ok(new { Poruka = "Aktivnost uspešno dodata." }) : BadRequest("Nije moguće dodati aktivnost.");
        }

        [HttpPut("aktivnost/{id}")]
        public async Task<IActionResult> IzmeniAktivnost(int id, [FromBody] Aktivnost aktivnost)
        {
            if (id != aktivnost.Id) return BadRequest("ID aktivnosti se ne poklapa.");
            var uspesno = await _travelDataServiceProxy.AzurirajAktivnostAsync(aktivnost);
            return uspesno ? Ok(new { Poruka = "Aktivnost uspešno izmenjena." }) : BadRequest("Nije moguće izmeniti aktivnost.");
        }

        [HttpDelete("aktivnost/{id}")]
        public async Task<IActionResult> ObrisiAktivnost(int id)
        {
            var uspesno = await _travelDataServiceProxy.ObrisiAktivnostAsync(id);
            return uspesno ? Ok(new { Poruka = "Aktivnost uspešno obrisana." }) : BadRequest("Nije moguće obrisati aktivnost.");
        }
    }
}
