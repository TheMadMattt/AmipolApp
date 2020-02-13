using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using AmipolAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Search.ImageSearch;
using Microsoft.Azure.CognitiveServices.Search.ImageSearch.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Renci.SshNet;

namespace AmipolAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ProductsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<Cennik> Get()
        {
            string host = _configuration.GetSection("FtpConn").GetSection("Address").Value;
            string username = _configuration.GetSection("FtpConn").GetSection("Login").Value;
            string password = _configuration.GetSection("FtpConn").GetSection("Pass").Value;
            string imageUrl = _configuration.GetSection("ImageFolder").Value;

            string localPath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "cennik.json");
            string remotePath = "/srv/kasy/cennik.json";
            string imageFile = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "urls/images/");


            using (SftpClient sftp = new SftpClient(host, 11122, username, password))
            {
                try
                {
                    sftp.Connect();

                    var sftpFile = sftp.GetLastWriteTime(remotePath);
                    var localFile = System.IO.File.GetLastWriteTime(localPath);

                    var fileExists = System.IO.File.Exists(localPath);

                    if (fileExists)
                    {
                        if (sftpFile > localFile)
                        {
                            await using Stream fileStream = System.IO.File.OpenWrite(localPath);
                            sftp.DownloadFile(remotePath, fileStream);
                        }
                    }
                    else
                    {
                        await using Stream fileStream = System.IO.File.OpenWrite(localPath);
                        sftp.DownloadFile(remotePath, fileStream);
                    }

                    sftp.Disconnect();

                    var json = System.IO.File.ReadAllText(localPath);

                    Cennik Cennik = JsonConvert.DeserializeObject<Cennik>(json);

                    Cennik.cennik = Cennik.cennik.Where(x => x.promocja || x.rabat > 0).ToList();

                    DirectoryInfo dir = new DirectoryInfo(imageFile);
                    foreach (var item in Cennik.cennik)
                    {
                        FileInfo[] files = dir.GetFiles(item.index + ".*");
                        if (files.Length > 0)
                        {
                            var name = files[0].Name;
                            item.imageUrl = imageUrl + name;
                        }
                    }

                    return Cennik;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                    System.IO.File.Delete(localPath);
                }
            }

            return null;
        }



        [Route("searchImages")]
        [HttpGet]
        public void SearchForImages()
        {
            string localPath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "cennik.json");
            string imageFile = System.IO.Directory.GetCurrentDirectory();
            imageFile += "/urls/";
            var json = System.IO.File.ReadAllText(localPath);

            Cennik Cennik;

            Cennik = JsonConvert.DeserializeObject<Cennik>(json);

            Cennik.cennik = Cennik.cennik.Where(x => x.promocja || x.rabat > 0).ToList();

            foreach (var item in Cennik.cennik)
            {
                var fileExists = System.IO.File.Exists(imageFile + item.index);
                if (!fileExists)
                {
                    if (item.index.Length >= 12)
                    {
                        var checkSum = CalculateChecksum(item.index);
                        var ean13 = item.index + checkSum;
                        var results = SearchImages(ean13).Value;
                        var imageItem = new ImageItem
                        {
                            Name = item.index,
                            ImagesList = new List<string>()
                        };
                        foreach (var imagesResult in results)
                        {
                            imageItem.ImagesList.Add(imagesResult.ContentUrl);
                        }
                        string imageItemJson = JsonConvert.SerializeObject(imageItem);
                        System.IO.File.WriteAllText(imageFile + item.index, imageItemJson);
                    }
                }
            }
        }

        [Route("downloadImages")]
        [HttpGet]
        public IActionResult DownloadImagesForItems()
        {
            string localPath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "cennik.json");
            string imageFile = System.IO.Directory.GetCurrentDirectory();
            imageFile += "/urls/";
            string imageFolder = imageFile + "/download/";

            var json = System.IO.File.ReadAllText(localPath);

            Cennik Cennik;

            Cennik = JsonConvert.DeserializeObject<Cennik>(json);

            Cennik.cennik = Cennik.cennik.Where(x => x.promocja || x.rabat > 0).ToList();

            foreach (var item in Cennik.cennik)
            {
                var exists = System.IO.File.Exists(imageFile + item.index);
                if (exists)
                {
                    var imageJson = System.IO.File.ReadAllText(imageFile + item.index);
                    var images = JsonConvert.DeserializeObject<IList<ImageObject>>(imageJson);
                    if (!System.IO.Directory.Exists(imageFolder + item.index))
                    {
                        System.IO.Directory.CreateDirectory(imageFolder + item.index);
                    }

                    if (IsDirectoryEmpty(imageFolder + item.index))
                    {
                        try
                        {
                            for (int i = 0; i < images.Count; i++)
                            {
                                if (images[i].ContentUrl != null)
                                {
                                    DownloadImages(imageFolder + item.index + @"/image" + i + ".png",
                                        images[i].ContentUrl,
                                        ImageFormat.Png);
                                }

                            }
                        }
                        catch (ExternalException e)
                        {
                            return StatusCode(500, e.Message);
                        }
                        catch (ArgumentNullException ex)
                        {
                            return StatusCode(500, ex.Message);
                        }
                    }
                }
            }

            return Ok();
        }

        public static int CalculateChecksum(string code)
        {
            if (code == null || code.Length != 12)
                throw new ArgumentException("Code length should be 12, i.e. excluding the checksum digit");

            int sum = 0;
            for (int i = 0; i < 12; i++)
            {
                int v;
                if (!int.TryParse(code[i].ToString(), out v))
                    throw new ArgumentException("Invalid character encountered in specified code.");
                sum += (i % 2 == 0 ? v : v * 3);
            }

            int check = 10 - (sum % 10);
            return check % 10;
        }

        public Images SearchImages(string searchTerm)
        {
            string subscriptionKey = "014247d4c10341f8b40a519e67641e32";
            var client = new ImageSearchClient(new ApiKeyServiceClientCredentials(subscriptionKey));

            Images imageResult = client.Images.SearchAsync(query: searchTerm).Result;

            return imageResult;
        }

        public void DownloadImages(string filename, string url, ImageFormat format)
        {
            WebClient client = new WebClient();
            try
            {
                Stream stream = client.OpenRead(url);
                var bitmap = new Bitmap(stream);

                bitmap.Save(filename, format);

                if (stream != null)
                {
                    stream.Flush();
                    stream.Close();
                }

                client.Dispose();

            }
            catch (WebException ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public bool IsDirectoryEmpty(string path)
        {
            return !Directory.EnumerateFileSystemEntries(path).Any();
        }
    }
}
