/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initAllMongooseConnections } = require('./config/mongoosemulti'); //we need to initialize mongoose SMS and PNS
require('./config/redissms'); //we need to initialize redis
require('./config/redissms'); //we need to initialize redis
const redisconf = require('./config/redisconf'); //we need to initialize redis conf
const { loadRedisConf } = require('./util/redisdataload');
const app = require('./server/app');  // Declare the app
const { logTime, dateFormat } = require('./util/formats');

const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initAllMongooseConnections(),  // Init mongoose SMS & PNS          
          redisconf.rclient.hset("apiadmin", "last", dateFormat(new Date())) //save last execution in Redis // little test redis
     ]);
     //END PARALLEL excution with await Promise.all.

     loadRedisConf();  //we don't need to wait this task


     // then we can Init api server
     app.listen(process.env.APIADMIN_PORT, () => {
          console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'APIADMIN HTTPS server is running on port ' + process.env.APIADMIN_PORT);
     }).on('error', (error) => {
          console.log(process.env.RED_COLOR, logTime(new Date()) + ' ERROR: Another App server is running this port ' + process.env.APISMS_PORT + " : " + error.message);
          console.error(error);
     });
}

initializeAllSources(); //Init Mongoose & redis


