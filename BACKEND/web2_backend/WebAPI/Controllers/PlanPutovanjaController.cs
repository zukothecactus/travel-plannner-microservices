using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Interfaces;
using TravelPlanner.Interfaces.Models;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.AspNetCore.Authorization;

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

        [HttpPost]
        public async Task<IActionResult> DodajNoviPlan([FromBody] PlanPutovanja plan)
        {
            try
            {
                // Pozivamo tvoju novu metodu
                var uspesno = await _travelDataServiceProxy.AddPlanPutovanjaAsync(plan);

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
                // Pozivamo tvoju novu metodu za dobavljanje
                var planovi = await _travelDataServiceProxy.GetPlanoviPutovanjaAsync();
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
                    var budgetProxy = ServiceProxy.Create<ISharingAndBudgetService>(
                new Uri("fabric:/TravelPlannerApp/SharingAndBudgetService"),
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
                var budgetProxy = ServiceProxy.Create<ISharingAndBudgetService>(
                    new Uri("fabric:/TravelPlannerApp/SharingAndBudgetService"),
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
                    var budgetProxy = ServiceProxy.Create<ISharingAndBudgetService>(
                        new Uri("fabric:/TravelPlannerApp/SharingAndBudgetService"),
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
    }
}
