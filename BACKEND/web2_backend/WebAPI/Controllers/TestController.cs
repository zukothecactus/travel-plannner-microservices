using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System;
using System.Threading.Tasks;
using TravelPlanner.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("ping")]
        public async Task<IActionResult> Ping()
        {
            // URI format: fabric:/ImeKrovneAplikacije/ImeServisa
            var proxy = ServiceProxy.Create<ITravelDataService>(
                new Uri("fabric:/TravelPlannerApp/TravelDataService"));

            try
            {
                var rezultat = await proxy.PingAsync();
                return Ok(rezultat);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri komunikaciji: {ex.Message}");
            }
        }
    }
}