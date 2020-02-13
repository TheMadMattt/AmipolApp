using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AmipolAPI.Models
{
    public class Settings
    {
        public List<SalesSettings> SalesList { get; set; }
        public int SaleDuration { get; set; }
    }
}
