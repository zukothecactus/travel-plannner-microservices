using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelPlanner.Interfaces.Models
{
    public class ToDoStavka
    {
        public int ID { get; set; }
        public string Tekst { get; set; }
        public bool JeZavrseno { get; set; }

        public int PlanPutovanjaId { get; set; }

    }
}
