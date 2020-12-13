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
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "likes")] HttpRequest req,
            ILogger log)
        {
            try
            {
                //Converting body to ExampleRequest
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                LikesClass likesClass = JsonConvert.DeserializeObject<LikesClass>(requestBody);

                //Converting ExampleRequest to ExampleRequestEntity for use in Azure Table Storage
                LikesEntity likesEntity = new LikesEntity(likesClass.Id, likesClass.Category)
                {
                    Id = likesClass.Id,
                    Likes = likesClass.Likes,
                    Dislikes = likesClass.Dislikes
                };

                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                //Azure Table storage shit
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = cloudTableClient.GetTableReference("LikeAndDislike");
                // Creates table if not exists
                await cloudTable.CreateIfNotExistsAsync();

                // haal de data op van de te veranderen row
                TableQuery<LikesEntity> rangeQuery = new TableQuery<LikesEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, likesEntity.Id));
                var queryresult = await cloudTable.ExecuteQuerySegmentedAsync<LikesEntity>(rangeQuery, null);
                var result = queryresult.Results;

                if (result.Count != 0)                             // kijken of die row al bestaat, zo niet doorgaan naar het aanmaken van de row
                {
                    // nieuwe likes and dislikes berekenen
                    LikesEntity likesEntityStorage = result[0];
                    likesEntityStorage.Likes += likesEntity.Likes;
                    likesEntityStorage.Dislikes += likesEntity.Dislikes;
                    // replace entity into table
                    TableOperation insertOperation = TableOperation.Replace(likesEntityStorage);
                    // execute replace operation
                    await cloudTable.ExecuteAsync(insertOperation);
                }
                else
                {
                    // insert entity into table
                    TableOperation insertOperation = TableOperation.Insert(likesEntity);
                    // execute insert operation
                    await cloudTable.ExecuteAsync(insertOperation);
                }

                return new OkObjectResult("");
            }
            catch (Exception e)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
