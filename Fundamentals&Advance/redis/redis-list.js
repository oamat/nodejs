var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });


//Some elements: redisClient.rpush(["mylist", "element1","element2"],  function (err, reply) { ...
//see https://redis.io/commands/rpush

redisClient.rpush("mylist", "element1", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});
redisClient.rpush("mylist", "element2", function (err, reply) {//append a element to a list
    if (err) console.log(err); else
        console.log("rpush reply :" + reply);
});

redisClient.lindex("mylist", 0, function (err, reply) { //get an element from list
    if (err) console.log(err); else
        console.log("lindex reply :" + reply);
});

/* redisClient.del("mylist", 0, function (err, reply) {
    if (err) console.log(err); else
        console.log("lindex reply :" +  reply);
}); */

redisClient.lpop("mylist", function (err, reply) { //Remove and get an element from list
    if (err) console.log(err); else
        console.log("lpop reply :" + reply);
});


redisClient.lrange("mylist", 0, -1, function (err, reply) { //get a range of elements
    if (err) console.log(err); else
        console.log("lange reply :" + reply);
});


redisClient.quit();