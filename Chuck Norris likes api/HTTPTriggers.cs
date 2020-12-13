using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Chuck_Norris_likes_api.Models;
using Microsoft.Azure.Cosmos.Table;

namespace Chuck_Norris_likes_api
{
    public static class Likes
    {
        [FunctionName("Likes")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "/likes")] HttpRequest req,
            ILogger log)
        {
            //Converting body to ExampleRequest
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            LikesEntity likesEntity = JsonConvert.DeserializeObject<LikesEntity>(requestBody);

            string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
            //Azure Table storage shit
            CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
            CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
            CloudTable cloudTable = cloudTableClient.GetTableReference("LikeAndDislike");
            // Creates table if not exists
            await cloudTable.CreateIfNotExistsAsync();
            // insert entity into table
            TableOperation insertOperation = TableOperation.Insert(exampleRequesEntity);
            // execute insert operation
            await cloudTable.ExecuteAsync(insertOperation);

            return new OkObjectResult("");
        }
    }
}
