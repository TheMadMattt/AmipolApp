using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AmipolAPI.Models
{
    public class Items
    {
        public string index { get; set; }
        public string nazwa { get; set; }
        public string jm { get; set; }
        public double cena { get; set; }
        public double cena_h { get; set; }
        public double rabat { get; set; }
        public string proc_vat { get; set; }
        public int waznosc { get; set; }
        public string tandem { get; set; }
        public bool promocja { get; set; }
        public double stan_rano { get; set; }
        public double stan { get; set; }
        public double przychod_7dni { get; set; }
        public double rozchod_7dni { get; set; }

        public string imageUrl { get; set; }
    }
}