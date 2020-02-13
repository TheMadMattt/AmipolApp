using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.CognitiveServices.Search.ImageSearch.Models;

namespace AmipolAPI.Models
{
    public class ImageItem
    {
        public string Name { get; set; }
        public List<string> ImagesList { get; set; }
    }
}
