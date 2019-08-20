/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConection } = require('./config/mongoose'); //we need to initialize mongoose
const {  rclient } = require('./config/redis'); //we need to initialize redis
const app = require('./server/app');  // Declare the app

const initializeAllSources = async () => { // Init Mongoose with await    
     //START PARALLEL excution with await Promise.all.
     await Promise.all([ //Async Promises: all tasks start immediately 
          initializeMongooseConection(),  // Init mongoose
          rclient.set("initializeRedisConection:test", "test") // little test redis
      ]);
      //END PARALLEL excution with await Promise.all.

     // then we can Init api server
     app.listen(process.env.PORT, () => {
          console.log(process.env.GREEN_COLOR, 'The HTTPS server is running on port ' + process.env.PORT);
     });
}

initializeAllSources(); //Init Mongoose & redis


