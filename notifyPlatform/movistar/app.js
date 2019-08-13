
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
    await initializeMongooseConection();  // Init mongoose
    await testRedisConection();  // test redis  
    cron.initCron();   // Init Cron
}

initializeAll();   // Init all necessary in order






