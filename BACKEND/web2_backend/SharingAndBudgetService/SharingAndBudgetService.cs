using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using TravelPlanner.Interfaces;
using Microsoft.ServiceFabric.Services.Remoting.Client;

namespace SharingAndBudgetService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class SharingAndBudgetService : StatefulService, ISharingAndBudgetService
    {
        public SharingAndBudgetService(StatefulServiceContext context)
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

            var redZaNotifikacije = await this.StateManager.GetOrAddAsync<IReliableQueue<string>>("notifikacijeRed");

            using (var tx = this.StateManager.CreateTransaction())
            {
                // AddOrUpdateAsync: Ako planId već postoji u rečniku, na staru vrednost dodajemo novi iznos.
                // Ako ne postoji, upisujemo inicijalni iznos.
                var novoStanje = await budzeti.AddOrUpdateAsync(tx, planId, iznos, (kljuc, staraVrednost) => staraVrednost + iznos);

                //Dodajemo poruku u red za notifikacije
                string poruka = $"Plan {planId}: Dodat trošak od {iznos}. Novi budžet iznosi: {novoStanje}";
                await redZaNotifikacije.EnqueueAsync(tx, poruka);


                // Zaključavamo transakciju i replikujemo podatke
                await tx.CommitAsync();

                return novoStanje;
            }
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

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
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
            var redZaNotifikacije = await this.StateManager.GetOrAddAsync<IReliableQueue<string>>("notifikacijeRed");

            //petlja koja radi u pozadini klastera
            while(true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var poruka = await redZaNotifikacije.TryDequeueAsync(tx);
                    if(poruka.HasValue)
                    {
                        //kasnije ce se implementirati slanje mejla ako bude trebalo za projekni zadatak lol

                        ServiceEventSource.Current.ServiceMessage(this.Context, $"[ASINHRONA OBRADA]: Poslat email -> {poruka.Value}");

                        await tx.CommitAsync();
                    }
                }

                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);

            }

        }
    }
}
