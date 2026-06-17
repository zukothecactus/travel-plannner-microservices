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
        public string? Naziv { get; set; }
        public string? Opis { get; set; }
        public DateTime DatumPocetka { get; set; }
        public DateTime DatumZavrsetka { get; set; }
        public double PlaniraniBudzet { get; set; }
        public int KorisnikId { get; set; } 

        public List<ToDoStavka> Spisak { get; set; } = new List<ToDoStavka>();

        //[JsonIgnore] stavljeni JsonIgnore atributi da bi se izbegla rekurzija prilikom serijalizacije u JSON, za swagger, ali swagger je hejter
        public ICollection<Destinacija> Destinacije { get; set; } = new List<Destinacija>();
        
        //[JsonIgnore]
        public ICollection<Trosak> Troskovi { get; set; } = new List<Trosak>();
    }
}
