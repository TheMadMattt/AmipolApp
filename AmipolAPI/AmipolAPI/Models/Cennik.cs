using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AmipolAPI.Models
{
    public class Cennik: IDisposable
    {
        public string data { get; set; }
        public List<Items> cennik { get; set; }

        public void Dispose()
        {
            data = null;
            cennik.Clear();
        }
    }
}