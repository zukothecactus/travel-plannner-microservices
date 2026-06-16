using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TravelPlanner.Interfaces;
using TravelPlanner.Interfaces.Models;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System;

namespace WebAPI.Controllers // Promeni u svoj namespace
{
    //sve mozze, al ako si admin
    [Authorize(Roles = "ADMIN")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ITravelDataService _travelDataServiceProxy;

        public AdminController()
        {
            _travelDataServiceProxy = ServiceProxy.Create<ITravelDataService>(
                new Uri("fabric:/TravelPlannerApp/TravelDataService")
            );
        }

        [HttpGet("korisnici")]
        public async Task<IActionResult> DobaviKorisnike()
        {
            var korisnici = await _travelDataServiceProxy.DobaviSveKorisnikeAsync();
            return Ok(korisnici);
        }

        [HttpDelete("korisnici/{id}")]
        public async Task<IActionResult> ObrisiKorisnika(int id)
        {
            var uspesno = await _travelDataServiceProxy.ObrisiKorisnikaAsync(id);
            if (uspesno)
            {
                return Ok("Korisnik uspešno obrisan.");
            }
            return BadRequest("Greška pri brisanju korisnika. Korisnik možda ne postoji.");
        }
    }
}