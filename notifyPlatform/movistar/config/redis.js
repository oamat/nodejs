/*
 * Redis configuration
 *
 */

//Dependencies
const redis = require('redis');

// Init and Create Client
const  rclient = redis.createClient({ host: process.env.REDIS_IP, port: process.env.REDIS_PORT });

// EventEmitter in case of Errors, stop all process
rclient.on('connect', function () { //we check the redis connection
    console.log(process.env.GREEN_COLOR, 'Connected to Redis Server: ' + process.env.REDIS_IP + ":" + process.env.REDIS_PORT);
});

rclient.on("error", function (error) {  //we check the redis connection is fine
    console.log(process.env.RED_COLOR, "FATAL ERROR : failed to connect to Redis server : " + process.env.REDIS_IP + ":" + process.env.REDIS_PORT);
    console.log(process.env.RED_COLOR, error);
    //process.exit(1);  //because platform doesn't works without Redis, we prefer to stop server
});

module.exports = { rclient };