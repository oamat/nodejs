var redis = require("redis");
var sub = redis.createClient({host: '192.168.99.100', port: '6379'});
var pub = redis.createClient({host: '192.168.99.100', port: '6379'});
var msg_count = 0;

sub.on("subscribe", function (channel, count) {
    pub.publish("1_Movistar_Channel", "I am sending a message.");
    pub.publish("1_Movistar_Channel", "I am sending a second message.");
    pub.publish("1_Movistar_Channel", "I am sending my last message.");
});

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    msg_count += 1;
    if (msg_count === 3) {
        sub.unsubscribe();
        sub.quit();
        pub.quit(); 
    }
});

sub.subscribe("1_Movistar_Channel");
redisClient.quit();