var cron = require('cron');
var redis = require('redis');

var CronJob = cron.CronJob;
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });
var id1;

console.log('Before job instantiation');
const job = new CronJob('* * * * * *', function() {
   
    console.log("fill the info...");
    id1=new Date().getTime();
    console.log('Saving to Redis this id:', id1); 
    redisClient.rpush("list_channel", id1, function (err, reply) {//append a element to a list
        if (err) console.log(err); else
            console.log("rpush reply :" + reply);
    });
    redisClient.hset("hash_channel", id1, "json1", function (err, reply) {  //Set the string value of a hash field.
        if (err) console.log(err); else
            console.log("id: " + id1 + " hset reply:" + reply);
    });    
});
console.log('After job instantiation');
job.start();