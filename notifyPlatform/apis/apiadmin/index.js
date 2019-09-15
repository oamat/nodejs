/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initAllMongooseConnections } = require('./config/mongoosemulti'); //we need to initialize mongoose SMS and PNS
const redissms = require('./config/redissms'); //we need to initialize redis
const redispns = require('./config/redissms'); //we need to initialize redis
const redisconf = require('./config/redisconf'); //we need to initialize redis conf
const redisdataload = require('./util/redisdataload');
const app = require('./server/app');  // Declare the app
const { logTime } = require('./util/formats');

const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initAllMongooseConnections(),  // Init mongoose SMS & PNS          
          redissms.rclient.set("initializeRedisConnection:test", "test"), // little test redis
          redispns.rclient.set("initializeRedisConnection:test", "test"), // little test redis
          redisconf.rclient.set("initializeRedisConnection:test", "test") // little test redis
     ]);
     //END PARALLEL excution with await Promise.all.

     redisdataload.loadRedisConfDependsOnDate();


     // then we can Init api server
     app.listen(process.env.APIADMIN_PORT, () => {
          console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'APIADMIN HTTPS server is running on port ' + process.env.APIADMIN_PORT);
     });
}

initializeAllSources(); //Init Mongoose & redis


