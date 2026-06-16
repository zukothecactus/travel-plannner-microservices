using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelPlanner.Interfaces.Models
{
    public class ToDoStavka
    {
        [Column("ID")]
        public int Id { get; set; }
        public string? Tekst { get; set; }
        public bool JeZavrseno { get; set; }

        public int PlanPutovanjaId { get; set; }

    }
}
