using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Net.Http.Headers;

namespace AmipolAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly string _imageFolder = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "urls/images/");
        private readonly IConfiguration _configuration;

        public ImageController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost, DisableRequestSizeLimit]
        public IActionResult UploadProductImage()
        {
            try
            {
                var file = Request.Form.Files[0];

                if (file.Length > 0)
                {
                    var imageExt = file.ContentType.Split("/")[1];
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).Name.ToString();
                    var image = fileName + "." + imageExt;
                    var fullPath = Path.Combine(_imageFolder, image);

                    string imageFolderUrl = _configuration.GetSection("ImageFolder").Value;
                    string imageUrl = imageFolderUrl + image;

                    var fileExists = System.IO.File.Exists(fullPath);

                    if (fileExists)
                    {
                        System.IO.File.Delete(fullPath);
                    }

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    return Ok(new { imageUrl });
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Route("delete")]
        [HttpDelete]
        public IActionResult DeleteImage(string itemIndex)
        {
            try
            {
                DirectoryInfo dir = new DirectoryInfo(_imageFolder);

                FileInfo[] files = dir.GetFiles(itemIndex + ".*");
                if (files.Length > 0)
                {
                    var imagePath = files[0].FullName;
                    System.IO.File.Delete(imagePath);
                    return Ok();
                }

                return BadRequest();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }
    }
}
