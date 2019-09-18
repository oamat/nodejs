
/*
 * Cron initializer for notify Platform 
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConnection } = require('./config/mongoosepns'); //we need to initialize mongoose
require('./config/redispns'); //we need to initialize redi
const redisconf = require('./config/redisconf'); //we need to initialize redis
const { dateFormat } = require('./util/formats'); // utils for formats

//cron Dependency
const cron = require('./cron/cron'); //the main cron

//Initialize all conections and cron
const initializeAll = async () => {
    //START PARALLEL excution with await Promise.all.
    await Promise.all([ //Async Promises: all tasks start immediately 
        initializeMongooseConnection(),  // Init mongoose
        redisconf.rclient.hset("collectorpns:GOO", "last", dateFormat(new Date())) //save last execution in Redis
    ]);
    //END PARALLEL excution with await Promise.all.

    // then we can Init Cron
    cron.initCron();   // Init Cron
}

initializeAll();   // Init all necessary in order






