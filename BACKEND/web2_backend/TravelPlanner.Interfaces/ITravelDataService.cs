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

        Task<bool> AddPlanPutovanjaAsync(PlanPutovanja plan, int korisnikId);
        Task<List<PlanPutovanja>> GetPlanoviPutovanjaAsync(int korisnikId);
        Task<PlanPutovanja> GetPlanPutovanjaSaDetaljimaAsync(int planId);
        Task<bool> AddDestinacijaAsync(Destinacija destinacija);
        Task<bool> AddTrosakAsync(Trosak trosak);
        Task<bool> ObrisiPlanPutovanjaAsync(int id);
        Task<bool> ObrisiTrosakAsync(int id);
        Task<bool> DodajToDoStavkuAsync(ToDoStavka stavka);
        Task<bool> PromeniStatusStavkeAsync(int id);
        Task<bool> ObrisiToDoStavkuAsync(int id);
        Task<bool> RegistrujKorisnikaAsync(RegistracijaDto podaci);
        Task<KorisnikInfo> ProverKredencijalAsync(PrijavaDto podaci);
        Task<List<KorisnikInfo>> DobaviSveKorisnikeAsync();
        Task<bool> ObrisiKorisnikaAsync(int korisnikId);

        Task<double> DobaviSumuTroskovaZaPlanAsync(int planId);
        Task<bool> ObrisiDestinacijuAsync(int destinacijaId);

        Task<bool> AzurirajPlanPutovanjaAsync(PlanPutovanja plan);

        Task<bool> AzurirajDestinacijuAsync(Destinacija destinacija);
        Task<bool> AzurirajTrosakAsync(Trosak trosak);

        Task<bool> PromeniUloguKorisnikaAsync(int korisnikId, string novaUloga);

    }
}
