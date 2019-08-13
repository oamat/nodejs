
/*
 * Cron initializer for notify Platform 
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations
const { initializeMongooseConection } = require('./config/mongoose'); //we need to initialize mongoose
require('./config/redis'); //we need to initialize redis

//cron Dependency
const cron = require('./cron/cron'); //the main cron

const initializeAll = async () => {   
    // Init mongoose
    await initializeMongooseConection();
    // Init cron's
    cron.initCron();
}

initializeAll();






