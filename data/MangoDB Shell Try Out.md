MongoDB Notes
====

1. Install MongoDB using Homebrew

2. Download backtest.zip from Dropbox

3. Unzip, make current working directory under `/accern`

4. Playground

```
// access to folder

cd accern/

// restore database

mongorestore alpha_backtest.bson

// start mongod

mongo

// show all databases

show dbs

// use database test

use test

// show stats info of test

db.stats()

// show all the collections in database test

show collections

// in collection alpha_backtest, select the first document

db.alpha_backtest.findOne()

// query + projection + pretty print

db.alpha_backtest.find({story_sentiment:{$lt: 0.02}}, {_id:1}).pretty()

// count()

db.alpha_backtest.count({story_sentiment: {$lt: 0.02}}, {_id: 1})

// aggregate

db.alpha_backtest.aggregate([
{$match:{'entities.name': "Apple Inc."}},
{$group: {_id:'entities.name', avg_story_sentiment: {$avg:"$story_sentiment"}}}])

// select documents that in certain day of certain company

db.alpha_backtest.find({$and:[{harvested_at:{$gte: new ISODate("2012-08-25T00:00:00Z")}}, {harvested_at:{$lt: new ISODate("2012-08-26T00:00:00Z")}}, {'event_impact_score.on_entities.entity': "AAPL"}]}).pretty()


// select fields and store as JSON file, 2014 Year
// ISODate need to converte to Date

mongoexport -v --db test --collection alpha_backtest --query '{harvested_at:{$gte: new Date(1388552400000), $lt: new Date(1420088400000)}}' --fieldFile ./fields.txt --type csv --out ./year2014.csv

	> ======== what in fields.txt ========
	> event_impact_score.on_entities.0.entity
	> article_sentiment
	> event_impact_score.on_entities.0.on_entity
	> harvested_at
	> ====================================  


// import csv to mongodb  

mongoimport -d test -c year2014 --type csv --file year2014.csv --headerline -v  


// aggregate data into company - date - average_article_senti - average_impact_score and save to
// a new collection in database  

db.year2014.aggregate(
[
  {
    $project: {
      _id:0,
      entity:1,
      article_sentiment:1,
      impact_score:1,
      year: {$substr: ["$harvested_at", 0, 4]},
      month: {$substr: ["$harvested_at", 5, 2]},
      day: {$substr: ["$harvested_at", 8, 2]}
    }   
  },

  {
    $group: {
      _id: {
        entity: "$entity",
        year: "$year",
        month: "$month",
        day: "$day"  
      },

      avg_article_sentiment: {
        $avg: "$article_sentiment"
      },

      avg_impact_score: {
        $avg: "$impact_score"
      }
    }
  },

  { $out: "daily_2014" }
],
  { allowDiskUse: true }
)  


// export aggregated result to csv file  
// some data field is NaN or Infinity, need to clean

mongoexport -v --db test --collection daily_2014 --fields _id.year,_id.month,_id.day,_id.entity,avg_article_sentiment,avg_impact_score --type csv --out ./daily_2014.csv
```  

