using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.Runtime.Serialization; //ponovo izbegavamo ciklicno ponasanje

namespace TravelPlanner.Interfaces.Models
{
    public class Aktivnost
    {
        public int Id { get; set; }
        public string Naziv { get; set; }
        public string Opis { get; set; }
        public DateTime VremePocetka { get; set; }
        public DateTime VremeZavrsetka { get; set; }

        // Strani ključ koji povezuje aktivnost sa određenom destinacijom
        public int DestinacijaId { get; set; }
        [JsonIgnore]
        //Ovaj ignore mora da postoji kako ne bismo imali kruznu zavisnost i kako bi validator ocekivao samo ID lol
        //Moramo da stavimo i znak pitanja kako bi se izbegle greške prilikom serijalizacije, jer u nekim slučajevima možda nećemo imati celu destinaciju već samo njen ID
        //.NET 8.0 nam zahteva da to naglasimo smh
        [IgnoreDataMember] // Ovo je tu da dodatno naglasi da se ovaj property ne bi trebao serijalizovati, iako JsonIgnore već radi taj posao, ali remoting to ne zna 
        public Destinacija? Destinacija { get; set; }
    }
}
