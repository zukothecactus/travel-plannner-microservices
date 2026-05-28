using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Interfaces.Models;

namespace TravelPlanner.Interfaces
{
    public interface ITravelDataService: IService
    {
        Task<string> PingAsync();

        Task<bool> AddPlanPutovanjaAsync(PlanPutovanja plan);
        Task<List<PlanPutovanja>> GetPlanoviPutovanjaAsync();
        Task<PlanPutovanja> GetPlanPutovanjaSaDetaljimaAsync(int planId);
        Task<bool> AddDestinacijaAsync(Destinacija destinacija);
        Task<bool> AddTrosakAsync(Trosak trosak);
    }
}
