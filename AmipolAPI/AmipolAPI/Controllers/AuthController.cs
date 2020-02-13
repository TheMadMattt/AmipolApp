using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AmipolAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AmipolAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private string pathToAuth = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "auth.json");

        [HttpPost]
        public User Post([FromBody] User user)
        {
            var json = System.IO.File.ReadAllText(pathToAuth);

            var userCheck = JsonConvert.DeserializeObject<Models.User>(json);

            if (userCheck.Username == user.Username && userCheck.Password == user.Password)
            {
                return userCheck;
            }

            return null;
        }
    }
}
