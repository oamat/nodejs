
/*
 * API Server, between index and routers... 
 *
 */

//require('./config/mongoose')
"use strict";

// Dependencies
require('./config/config'); //we need configurations
require('./config/mongoose'); //we need to initialize mongoose
require('./config/redis'); //we need to initialize redis

//cron Dependency
const cron = require('./cron/cron'); //we need to initialize redis

// Init cron
//TODO: get interval from redis
cron.initCron( 100 );





