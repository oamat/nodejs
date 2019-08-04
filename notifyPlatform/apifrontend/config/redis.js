const redis = require('redis');
// Create Client
const client = redis.createClient({ host: process.env.REDIS_IP, port: process.env.REDIS_PORT });

client.on('connect', function(){ //we check the redis connection
	console.log(process.env.GREEN_COLOR, 'Connected to Redis Server: ' + process.env.REDIS_IP+":"+process.env.REDIS_PORT );
});

client.on("error", function (error) {  //we check the redis connection is fine
    console.log(process.env.RED_COLOR, "FATAL ERROR : failed to connect to Redis server : " + process.env.REDIS_IP+":"+process.env.REDIS_PORT);
    console.log(process.env.RED_COLOR, error);   
    process.exit(1);  //because platform doesn't works without Redis, we prefer to stop server
});

module.exports = { client };