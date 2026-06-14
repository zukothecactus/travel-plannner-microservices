using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelPlanner.Interfaces.Models
{
    public class PrijavaDto
    {
        [Required(ErrorMessage = "Email je obavezan.")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Lozinka je obavezna.")]
        public string Lozinka { get; set; }
    }
}
