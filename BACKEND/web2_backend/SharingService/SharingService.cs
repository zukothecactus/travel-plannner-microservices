using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TravelPlanner.Interfaces;
using TravelPlanner.Interfaces.Models;

namespace SharingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class SharingService : StatefulService, ISharingService
    {
        public SharingService(StatefulServiceContext context)
            : base(context)
        { }

        public async Task PosaljiNotifikacijuAsync(string poruka)
        {
            var redZaNotifikacije = await this.StateManager.GetOrAddAsync<IReliableQueue<string>>("notifikacijeRed");
            using (var tx = this.StateManager.CreateTransaction())
            {
                await redZaNotifikacije.EnqueueAsync(tx, poruka);
                await tx.CommitAsync();
            }
        }
        public async Task<DetaljiDeljenja> DobaviDetaljeDeljenjaAsync(string token)
        {
            // Dobavljamo ili kreiramo rečnik unutar stanja servisa
            var deljenjaRecnik = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, DetaljiDeljenja>>("deljenjaLinkoviRecnik");

            using (var tx = this.StateManager.CreateTransaction())
            {
                // Pokušavamo da izvučemo podatke na osnovu jedinstvenog tokena (ključa)
                var rezultat = await deljenjaRecnik.TryGetValueAsync(tx, token);

                if (rezultat.HasValue)
                {
                    // Ako podatak postoji, vraćamo ga (transakcija se automatski zatvara kroz using blok)
                    return rezultat.Value;
                }

                return null; // Token ne postoji ili je obrisan/istekao
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
