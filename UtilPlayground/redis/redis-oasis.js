

//see https://redis.io/commands/multi

var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });


console.log("fill the info...");
redisClient.hset("hash_channel", "id1", "json1", function (err, reply) {  //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});

redisClient.hset("hash_channel", "id2", "json2", function (err, reply) { //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});

redisClient.rpush("list_channel", "id1", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});
redisClient.rpush("list_channel", "id2", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});

redisClient.hkeys("hash_channel", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
});




redisClient.lpop("list_channel", function (err, reply) {
    console.log("..........................");
    console.log("get & remove 1 id from id_channel, not from hash_channel");
    console.log("..........................");

    if (err) console.log(err); else
        console.log("lpop reply :" + reply);


});



redisClient.hget("hash_channel", "id1", function (err, reply) {
    console.log("..........................");
    console.log("recover json from hash_channel");
    console.log("..........................");

    if (err) console.log(err); else
        console.log("hget reply :" + reply);

    console.log("..........................");
    console.log("Do anything with json message...");
    console.log("..........................");
});





redisClient.hdel("hash_channel", "id1", function (err, reply) {

    console.log("..........................");
    console.log("Remove json from hash_channel");
    console.log("..........................");

    if (err) console.log(err); else
        console.log("hdel reply :" + reply);
});

redisClient.del("hash_channel");
redisClient.del("list_channel");
redisClient.quit();




