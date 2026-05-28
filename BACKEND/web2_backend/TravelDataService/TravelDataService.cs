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


        public async Task<bool> AddPlanPutovanjaAsync(PlanPutovanja plan)
        {
            using (var context = new TravelDbContext())
            {
                // Entity Framework sam prati stanje, samo dodamo objekat i sačuvamo
                context.PlanoviPutovanja.Add(plan);
                await context.SaveChangesAsync();
                return true;
            }
        }


        public async Task<List<PlanPutovanja>> GetPlanoviPutovanjaAsync()
        {
            using (var context = new TravelDbContext())
            {
                // Vraćamo sve planove kao listu
                return await context.PlanoviPutovanja.ToListAsync();
            }
        }

        public async Task<PlanPutovanja> GetPlanPutovanjaSaDetaljimaAsync(int planId)
        {
            using (var context = new TravelDbContext())
            {
                return await context.PlanoviPutovanja.Include(p => p.Destinacije).ThenInclude(d => d.Aktivnosti)
                    .Include(p => p.Troskovi)
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
