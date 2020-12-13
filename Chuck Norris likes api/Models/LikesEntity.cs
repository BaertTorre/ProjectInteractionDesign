using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Text;

namespace Chuck_Norris_likes_api.Models
{
    class LikesEntity : TableEntity
    {
        public LikesEntity()
        {
            //Can be changed to whatevery you want
            PartitionKey = this.Likes.ToString();
            RowKey = this.Id; // Has to be unique for each row you add

        }

        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public string Id { get; set; }
    }
}
