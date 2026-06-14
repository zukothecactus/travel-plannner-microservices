using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System;
using System.Threading.Tasks;
using TravelPlanner.Interfaces; // Namespace gde ti je ITravelDataService
using TravelPlanner.Interfaces.Models; // Pobrini se da je ovde tvoj tačan namespace za modele
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITravelDataService _travelDataServiceProxy;

        public AuthController()
        {
            _travelDataServiceProxy = ServiceProxy.Create<ITravelDataService>(
                new Uri("fabric:/TravelPlannerApp/TravelDataService")
            );
        }

        [HttpPost("registracija")]
        public async Task<IActionResult> Registracija([FromBody] RegistracijaDto podaci)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var uspesno = await _travelDataServiceProxy.RegistrujKorisnikaAsync(podaci);

            if (uspesno)
            {
                return Ok("Korisnik je uspešno registrovan.");
            }

            return BadRequest("Korisnik sa ovim email-om već postoji.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] PrijavaDto podaci)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var korisnik = await _travelDataServiceProxy.ProverKredencijalAsync(podaci);

            if(korisnik == null)
            {
                return Unauthorized("Neispravan email ili lozinka");
            }

            var tokenString = GenerateJwtToken(korisnik);

            return Ok(new { Token = tokenString, Korisnik = korisnik });
        }

        private string GenerateJwtToken(KorisnikInfo korisnik)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("nekiTajniKljucZaJWTmoraDaBudeJakoDugacakIliEnkripcijaNeceRaditiKakoTrebaIProgramCeOtkazati")); // Trebalo bi da ovo bude u konfiguraciji, ne hardkodirano)); minimum 32 karaktera (32*8 = 256 bit)
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, korisnik.Id.ToString()),
                new Claim(ClaimTypes.Name, korisnik.Ime),
                new Claim(ClaimTypes.Email, korisnik.Email),
                new Claim(ClaimTypes.Role, korisnik.Uloga)
            };

            var token = new JwtSecurityToken(
                
                issuer: "TravelPlannerApp",
                audience: "TravelPlannerAppUsers",
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}