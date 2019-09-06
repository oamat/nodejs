/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConnection } = require('./config/mongoosepns'); //we need to initialize mongoose
const redispns = require('./config/redispns'); //we need to initialize redis
const redisconf = require('./config/redisconf'); //we need to initialize redis
const { logTime } = require('./util/formats');

const app = require('./server/app');  // Declare the app

const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initializeMongooseConnection(),  // Init mongoose
          redispns.rclient.set("initializeRedisConnection:test", "test"), // little test redis
          redisconf.rclient.set("initializeRedisConnection:test", "test") // little test redis
      ]);
      //END PARALLEL excution with await Promise.all.

     // then we can Init api server
     app.listen(process.env.APIPNS_PORT, () => {
          console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'APIPNS HTTPS server is running on port ' + process.env.APIPNS_PORT);
     });
}

initializeAllSources(); //Init Mongoose & redis


