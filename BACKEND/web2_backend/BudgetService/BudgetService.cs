using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TravelPlanner.Interfaces;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;

namespace BudgetService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class BudgetService : StatefulService, IBudgetService
    {
        public BudgetService(StatefulServiceContext context)
            : base(context)
        { }

        public async Task<double> DobaviUkupnuPotrosnjuAsync(int planId)
        {
            var budzeti = await this.StateManager.GetOrAddAsync<IReliableDictionary<int, double>>("budzetRecnik");

            // 1. Prva brza transakcija: Samo proveravamo da li podatak već postoji u kešu
            using (var tx = this.StateManager.CreateTransaction())
            {
                var rezultat = await budzeti.TryGetValueAsync(tx, planId);
                if (rezultat.HasValue)
                {
                    return rezultat.Value; // Ako postoji, odmah vraćamo i završavamo posao
                }
            }

            // 2. CACHE MISS: Mrežni poziv radimo POTPUNO VAN transakcije
            var travelDataProxy = ServiceProxy.Create<ITravelDataService>(
                new Uri("fabric:/TravelPlannerApp/TravelDataService"));

            // Pozivamo našu novu, laganu metodu koja vraća samo običan double
            double inicijalnaPotrosnja = await travelDataProxy.DobaviSumuTroskovaZaPlanAsync(planId);

            // 3. Druga brza transakcija: Otvaramo novu transakciju samo da upišemo vrednost u rečnik
            using (var tx = this.StateManager.CreateTransaction())
            {
                await budzeti.AddOrUpdateAsync(tx, planId, inicijalnaPotrosnja, (kljuc, staraVrednost) => inicijalnaPotrosnja);
                await tx.CommitAsync();
            }

            return inicijalnaPotrosnja;
        }

        public async Task<double> DodajTrosakUBudzetAsync(int planId, double iznos)
        {
            // Tražimo (ili pravimo) naš rečnik u memoriji klastera
            var budzeti = await this.StateManager.GetOrAddAsync<IReliableDictionary<int, double>>("budzetRecnik");
            double novoStanje;

            using (var tx = this.StateManager.CreateTransaction())
            {
                novoStanje = await budzeti.AddOrUpdateAsync(tx, planId, iznos, (kljuc, staraVrednost) => staraVrednost + iznos);
                await tx.CommitAsync();
            }

            // 2. Umesto lokalnog reda, obaveštavamo SharingService!
            try
            {
                // Uzimamo hardkodovanu particiju 0 pošto SharingService trenutno nema strogu podelu
                var sharingProxy = ServiceProxy.Create<ISharingService>(
                    new Uri("fabric:/TravelPlannerApp/SharingService"),
                    new ServicePartitionKey(0));

                string poruka = $"Plan {planId}: Dodat trošak od {iznos}. Novi budžet iznosi: {novoStanje}";
                await sharingProxy.PosaljiNotifikacijuAsync(poruka);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(this.Context, $"Greška kod obaveštavanja: {ex.Message}");
            }

            return novoStanje;
        }
        

        //Kada se ključ obriše, sledeći poziv ka tom servisu će automatski izračunati novu vrednost iz baze.
        //treba nam kada promenimo budzet u TravelDataService, da bi se keš invalidirao i sledeći put kada se pozove metoda DobaviUkupnuPotrosnjuAsync, da se iz baze ponovo izračuna.
        public async Task InvalidirajKesBudzetaAsync(int planId)
        {
            var budzeti = await this.StateManager.GetOrAddAsync<IReliableDictionary<int, double>>("budzetRecnik");
            using (var tx = this.StateManager.CreateTransaction())
            {
                await budzeti.TryRemoveAsync(tx, planId);
                await tx.CommitAsync();
            }
        }
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            var myDictionary = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");

                    ServiceEventSource.Current.ServiceMessage(this.Context, "Current Counter Value: {0}",
                        result.HasValue ? result.Value.ToString() : "Value does not exist.");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);

                    // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                    // discarded, and nothing is saved to the secondary replicas.
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
