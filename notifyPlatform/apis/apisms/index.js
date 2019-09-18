/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConnection } = require('./config/mongoosesms'); //we need to initialize mongoose
require('./config/redissms'); //we need to initialize redis
const redisconf = require('./config/redisconf'); //we need to initialize redis
const { logTime, dateFormat } = require('./util/formats');
const app = require('./server/app');  // Declare the app

const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initializeMongooseConnection(),  // Init mongoose
          redisconf.rclient.hset("apisms", "last", dateFormat(new Date())) //save last execution in Redis // little test redis
     ]);
     //END PARALLEL excution with await Promise.all.


     // then we can Init api server
     app.listen(process.env.APISMS_PORT, () => {
          console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'APISMS HTTPS server is running on port ' + process.env.APISMS_PORT);
     }).on('error', (error) => {
          console.log(process.env.RED_COLOR, logTime(new Date()) + ' ERROR: Another App server is running this port ' + process.env.APISMS_PORT + " : " + error.message);
          console.error(error);
     });
}

initializeAllSources(); //Init Mongoose & redis


