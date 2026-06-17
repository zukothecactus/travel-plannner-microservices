using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelPlanner.Interfaces
{
    public interface ISharingAndBudgetService: IService
    {
        Task<double> DodajTrosakUBudzetAsync(int planId, double iznos);
        Task<double> DobaviUkupnuPotrosnjuAsync(int planId);
        Task InvalidirajKesBudzetaAsync(int planId);
    }
}
