//const MongoClient = require('mongodb').MongoClient;   
//const ObjectID = require('mongodb').ObjectID;  
    // Is exactly the same of :
 const {MongoClient, ObjectID} = require('mongodb');

 var obj = new ObjectID();
 console.log(obj);  // if I need to insert some objects manualy


const url = 'mongodb://localhost:27017';  // Connection url
const dbName = 'test';  // Database Name
const optionsMongo = { useNewUrlParser: true }; //options Mongodb see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html#.connect
const collection = 'todos';

// Connect using MongoClient
MongoClient.connect(url, optionsMongo , function (err, client) {  

  if (err) {  //manage error
    return console.log('Unable to connect to MongoDB server' + err);
  }
  console.log('Connected to MongoDB server...');
  const col = client.db(dbName).collection(collection);  // Create a collection
  
  //Here we can do something  
  console.log("col.stats : " + col.stats);

  col.insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });
  
  //END Here we can do something
  client.close(function(err){
     console.log('Close connection to MongoDB server...');
  });
 
});