/*
 * Redis configuration
 *
 */

//Dependencies
const redis = require('redis');
const { logTime } = require('../util/formats');

// Init and Create Client
const rclient = redis.createClient({ host: process.env.REDISCONF_IP, port: process.env.REDISCONF_PORT });

// EventEmitter in case of Errors, stop all process
rclient.on('connect', function () { //we check the redis connection
    console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'Connected to Redis CONF Server: ' + process.env.REDISCONF_IP + ":" + process.env.REDISCONF_PORT);
});

rclient.on("error", function (error) {  //we check the redis connection is fine
    let date = new Date();
    console.log(process.env.RED_COLOR, logTime(date) + " ERROR : failed to reconnect to Redis CONF server : " + process.env.REDISCONF_IP + ":" + process.env.REDISCONF_PORT);
    console.log(process.env.RED_COLOR, logTime(date) + error);
    //process.exit(1);  //because platform doesn't works without Redis, we prefer to stop server
});

module.exports = { rclient };