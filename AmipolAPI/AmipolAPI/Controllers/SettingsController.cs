using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AmipolAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AmipolAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        public string SettingsFile = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "sales-settings.json");

        // GET: api/Settings
        [HttpGet]
        public Settings Get()
        {
            var exists = System.IO.File.Exists(SettingsFile);
            if (exists)
            {
                var settingsJson = System.IO.File.ReadAllText(SettingsFile);

                var settingsList = JsonConvert.DeserializeObject<Settings>(settingsJson);

                return settingsList;
            }

            return new Settings()
            {
                SalesList = new List<SalesSettings>(),
                SaleDuration = 5
            };
        }

        // POST: api/Settings
        [HttpPost]
        public Settings Post([FromBody] Settings settingsList)
        {
            var settingsJson = JsonConvert.SerializeObject(settingsList);

            var exists = System.IO.File.Exists(SettingsFile);
            if (exists)
            {
                System.IO.File.Delete(SettingsFile);
            }
            
            System.IO.File.WriteAllText(SettingsFile,settingsJson);

            return settingsList;
        }
    }
}
