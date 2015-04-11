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


// select fields and store as JSON file 

mongoexport -v --db test --collection alpha_backtest --fieldFile ~/Desktop/fields.txt --type csv --out ~/Desktop/1k_sampled.csv

	> ======== what in fields.txt ========
	> event_impact_score.on_entities.0.entity
	> article_sentiment
	> event_impact_score.on_entities.0.on_entity
	> harvested_at
	> ====================================  


// import csv to mongodb  

mongoimport -d test -c alpha --type csv --file selected_data.csv --headerline -v  


// select documents that in certain day of certain company

db.alpha_backtest.find({$and:[{harvested_at:{$gte: new ISODate("2012-08-25T00:00:00Z")}}, {harvested_at:{$lt: new ISODate("2012-08-26T00:00:00Z")}}, {'event_impact_score.on_entities.entity': "AAPL"}]}).pretty()
```  

