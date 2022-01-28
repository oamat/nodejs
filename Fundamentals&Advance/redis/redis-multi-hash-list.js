

//see https://redis.io/commands/multi

var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });


redisClient.hset("key", "field1", "value1", function (err, reply) {  //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});

redisClient.hset("key", "field2", "value2", function (err, reply) { //Set the string value of a hash field.
    if (err) console.log(err); else
        console.log("hset reply:" + reply);
});

redisClient.rpush("mylist", "field1", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});
redisClient.rpush("mylist", "field2", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});

redisClient.hkeys("key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
});




redisClient.hexists("key", "field1", function (err, exist) {
    if (exist) {
        var multi = redisClient.multi();

        multi.lpop("mylist", function (err, reply) {
            if (err) console.log(err); else
                console.log("lpop reply :" + reply);
        });


        multi.hget("key", "field1", function (err, reply) {
            if (err) console.log(err); else
                console.log("multi.hget reply :" + reply);
        });
        multi.hdel("key", "field1", function (err, reply) {
            if (err) console.log(err); else
                console.log("multi.hdel reply :" + reply);
        });
    
        multi.exec(function (err, reply) {
            if (err) console.log(err); else
                console.log("multi.exec reply :" + reply);
        });
    }
    redisClient.quit();
});




