/*
 *  Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
require('./config/redissms'); //we need to initialize redis
const fs = require('fs');
const https = require('https');
const redisconf = require('./config/redisconf'); //we need to initialize redis
const app = require('./server/app');  // Declare the app
const { initializeMongooseConnection } = require('./config/mongoosesms'); //we need to initialize mongoose
const { logTime, dateFormat } = require('./util/formats');

//VAR & CONST
const httpsServerOptions = {
     'key': fs.readFileSync('./ssl/server.key'),
     'cert': fs.readFileSync('./ssl/server.cert')
};


const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initializeMongooseConnection(),  // Init mongoose
          redisconf.rclient.hset("apisms", "last", dateFormat(new Date())) //save last execution in Redis // little test redis
     ]);
     //END PARALLEL excution with await Promise.all.

     // //OLD HTTP: app.listen(process.env.APISMS_PORT, () => {
     // app.listen(30010, () => {                        
     //      }).on('error', (error) => {
     //           console.log(process.env.RED_COLOR, logTime(new Date()) + ' ERROR: Another App server is running this port 30010');
     //           console.error(error);
     //      });

     // then we can Init api server       
     https.createServer( httpsServerOptions , app).listen(process.env.APISMS_PORT, () => {     
          console.log(process.env.GREEN_COLOR, logTime(new Date()) + 'APISMS HTTPS server is running on port ' + process.env.APISMS_PORT);
     }).on('error', (error) => {
          console.log(process.env.RED_COLOR, logTime(new Date()) + ' ERROR: Another App server is running this port ' + process.env.APISMS_PORT + " : " + error.message);
          console.error(error);
     });
}

initializeAllSources(); //Init Mongoose & redis


