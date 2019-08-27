
/*
 * Cron initializer for notify Platform 
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConnection } = require('./config/mongoosesms'); //we need to initialize mongoose
const { rclient } = require('./config/redissms'); //we need to initialize redis

//cron Dependency
const cron = require('./cron/cron'); //the main cron

//Initialize all conections and cron
const initializeAll = async () => {
    //START PARALLEL excution with await Promise.all.
    await Promise.all([ //Async Promises: all tasks start immediately 
        initializeMongooseConnection(),  // Init mongoose
        await rclient.set("initializeRedisConnection:test", "test") // little test redis
    ]);
    //END PARALLEL excution with await Promise.all.

    // then we can Init Cron
    cron.initCron();   // Init Cron
}

initializeAll();   // Init all necessary in order






