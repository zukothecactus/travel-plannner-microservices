using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelPlanner.Interfaces.Models
{
    public class Korisnik
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Ime { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string LozinkaHash { get; set; } // Ovde ide BCrypt hešovana lozinka, nikako čist tekst!

        [Required]
        public string Uloga { get; set; } = "KORISNIK"; // Može biti "KORISNIK" ili "ADMIN"
    }
}
