using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TravelPlanner.Interfaces.Models
{
    public class Destinacija
    {
        public int Id { get; set; }
        public string? NazivMesta { get; set; }
        public string? Napomena { get; set; }
        public DateTime DatumDolaska { get; set; }
        public DateTime DatumOdlaska { get; set; }

        // Strani ključ koji povezuje destinaciju sa planom putovanja
        public int PlanPutovanjaId { get; set; }

        [JsonIgnore]
        [IgnoreDataMember]
        public PlanPutovanja? PlanPutovanja { get; set; }

        // Svaka destinacija ima svoj dnevni plan aktivnosti
        public ICollection<Aktivnost> Aktivnosti { get; set; } = new List<Aktivnost>();
    }
}
