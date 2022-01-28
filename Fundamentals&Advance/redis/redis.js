var redis = require("redis"),
    client = redis.createClient({host: '192.168.99.100', port: '6379'});

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});

client.set("string key", "string val", redis.print);

client.set("key1", "some val1", redis.print);
client.set("key2", "some val2", redis.print);
client.set("key3", "some val3", redis.print);
client.set(["key4", "some val4"]);

client.hset("hash key", "hashtest1", "some value", redis.print);
client.hset(["hash key", "hashtest2", "some other value"], redis.print);

client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});


// This will return a JavaScript String
client.get("key1", function (err, reply) {
    console.log(reply.toString()); // Will print `OK`
});