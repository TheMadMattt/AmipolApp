using Microsoft.AspNetCore.Mvc;

namespace AmipolAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public string Get()
        {
            return "Api for AMIPOL";
        }
    }
}
