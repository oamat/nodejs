
/*
 * Cron initializer for notify Platform 
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConection } = require('./config/mongoose'); //we need to initialize mongoose
const { testRedisConection } = require('./config/redis'); //we need to initialize redis

//cron Dependency
const cron = require('./cron/cron'); //the main cron

//Initialize all conections and cron
const initializeAll = async () => {
    //START PARALLEL excution with await Promise.all.
    await Promise.all([ //Async Promises: all tasks start immediately 
        initializeMongooseConection(),  // Init mongoose
        testRedisConection() // little test redis
    ]);
    //END PARALLEL excution with await Promise.all.

    // then we can Init Cron
    cron.initCron();   // Init Cron
}

initializeAll();   // Init all necessary in order






