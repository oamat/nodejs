var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });


// some elements : redisClient.sadd(["myset", "element1", "element1", "element2"], function (err, reply) {
//see https://redis.io/commands/sadd

redisClient.sadd("myset", "field1" , function (err, reply) {  //append a set 
    if (err) console.log(err); else
        console.log("sadd reply :" + reply);
});
redisClient.sadd("myset", "field2" , function (err, reply) {   //append a set  
    if (err) console.log(err); else
        console.log("sadd reply :" + reply);
});
redisClient.sadd("myset", "element1", function (err, reply) {   //append a set 
    if (err) console.log(err); else
        console.log("sadd reply EQUAL :" + reply);
});


redisClient.sdiff("myset", function (err, reply) { //substract a set
    if (err) console.log(err); else
        console.log("sdiff reply :" + reply);
});


redisClient.spop("myset", function (err, reply) { //Remove and return a set
    if (err) console.log(err); else
        console.log("spop reply :" + reply);
});

redisClient.sdiff("myset", function (err, reply) { //substract a set
    if (err) console.log(err); else
        console.log("sdiff reply :" + reply);
});

redisClient.quit();