using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;

namespace TravelPlanner.Interfaces
{
    public interface ISharingService : IService
    {
        // Metoda preko koje WebAPI ili BudgetService prijavljuju novi događaj
        Task PosaljiNotifikacijuAsync(string poruka);
    }
}
