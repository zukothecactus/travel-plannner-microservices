using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Runtime.Serialization;

namespace TravelPlanner.Interfaces.Models
{
    public class Trosak
    {
        public int Id { get; set; }
        public string? Kategorija { get; set; } // npr. Prevoz, Smeštaj, Hrana, Ulaznice
        public string? Opis { get; set; }

        // Iznos je double, prateći tvoju logiku za budžet
        public double Iznos { get; set; }
        public DateTime Datum { get; set; }

        // Strani ključ ka planu putovanja
        public int PlanPutovanjaId { get; set; }

        [JsonIgnore]
        [IgnoreDataMember]
        public PlanPutovanja? PlanPutovanja { get; set; }
    }
}
