/* we want save this hash:
 {
    "webserver" : "expressjs",
        "database" : "mongoDB",
            "devops" : "jenkins"
} */

//see https://redis.io/commands/hmset

var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });

redisClient.hmset("hashkey", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins",  //Set multiple hash fields to multiple values.
    function (err, reply) {
        if (err) console.log(err); else
            console.log("hmset reply:" + reply);
    });

redisClient.hgetall("hashkey", function (err, reply) { //Get all fields and values in a hash.
    if (err) console.log(err); else
        console.log("hgetall reply :" + JSON.stringify(reply));
});

redisClient.hset("key", "field1", "value1", function (err, reply) { //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});

redisClient.hset("key", "field2", "value2", function (err, reply) { //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});


redisClient.hget("key", "field1", function (err, reply) { //Get the value of a hash field.
    if (err) console.log(err); else
        console.log("hget reply :" + reply);
});



redisClient.hexists("key", "field1", function (err, reply) { //Determine if a hash field exists.
    if (err) console.log(err); else
        console.log("hexists reply :" + reply);
});

redisClient.hkeys("key", function (err, replies) {  //Get all the fields of a hash.
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
});

redisClient.quit();