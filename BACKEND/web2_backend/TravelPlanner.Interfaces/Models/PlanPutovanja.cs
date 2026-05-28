using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace TravelPlanner.Interfaces.Models
{
    public class PlanPutovanja
    {
        public int Id { get; set; }
        public string Naziv { get; set; }
        public string Opis { get; set; }
        public DateTime DatumPocetka { get; set; }
        public DateTime DatumZavrsetka { get; set; }
        public double PlaniraniBudzet { get; set; }
        public ICollection<Destinacija> Destinacije { get; set; } = new List<Destinacija>();
        public ICollection<Trosak> Troskovi { get; set; } = new List<Trosak>();
    }
}
