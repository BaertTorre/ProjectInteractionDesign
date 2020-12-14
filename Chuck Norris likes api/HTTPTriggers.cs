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
using System.Diagnostics;

namespace Chuck_Norris_likes_api
{
    public static class Likes
    {
        [FunctionName("Likes")]
        public static async Task<IActionResult> PUTLikes(
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

                LikesResponseClass likesResponseClass = new LikesResponseClass();
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
                    likesResponseClass.Likes = likesEntityStorage.Likes;
                    likesResponseClass.Dislikes = likesEntityStorage.Dislikes;
                }
                else
                {
                    // insert entity into table
                    TableOperation insertOperation = TableOperation.Insert(likesEntity);
                    // execute insert operation
                    await cloudTable.ExecuteAsync(insertOperation);
                    likesResponseClass.Likes = likesEntity.Likes;
                    likesResponseClass.Dislikes = likesEntity.Dislikes;
                }

                return new OkObjectResult(likesResponseClass);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                return new StatusCodeResult(500);
            }
        }


        [FunctionName("GetLikes")]
        public static async Task<IActionResult> GETLikes(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "likes")] HttpRequest req,
            ILogger log)
        {
            try
            {
                //Converting body to ExampleRequest
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                //Azure Table storage shit
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = cloudTableClient.GetTableReference("LikeAndDislike");
                // Creates table if not exists
                await cloudTable.CreateIfNotExistsAsync();

                // haal de data op van de row
                TableQuery<LikesEntity> rangeQuery = new TableQuery<LikesEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, requestBody));
                var queryresult = await cloudTable.ExecuteQuerySegmentedAsync<LikesEntity>(rangeQuery, null);
                var result = queryresult.Results;

                LikesResponseClass likesResponseClass = new LikesResponseClass();
                if (result.Count != 0)                             // kijken of die row gevonde is
                {
                    // de gekregen likes en dislikes in de antwoord class steken
                    LikesEntity likesEntityStorage = result[0];
                    likesResponseClass.Likes = likesEntityStorage.Likes;
                    likesResponseClass.Dislikes = likesEntityStorage.Dislikes;
                }
                else
                {
                    likesResponseClass.Likes = 0;
                    likesResponseClass.Dislikes = 0;
                }

                return new OkObjectResult(likesResponseClass);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                return new StatusCodeResult(500);
            }
        }
    }
}
