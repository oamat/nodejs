var redis = require('redis');
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });

redisClient.on('ready', function () {
    console.log("Redis is ready");
});

redisClient.set("mylanguage", "nodejs", function (err, reply) {  // you can open redis-cli and execute "GET mylanguage"
    if (err) console.log(err); else
        console.log("get reply: " + reply);
});

redisClient.get("mylanguage", function (err, reply) {
    if (err) console.log(err); else
        console.log("set reply: " + reply);
});

redisClient.on('error', function () {
    console.log("Error in Redis");
});

redisClient.quit();