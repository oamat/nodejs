var redis = require("redis");
var sub = redis.createClient({host: '192.168.99.100', port: '6379'});


sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message); 
});

sub.subscribe("1Online_Movistar_Channel");