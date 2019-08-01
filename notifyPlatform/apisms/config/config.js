/*
 * Load all Configurations
 *         see configs.json for all configsurations X enviroment
 *
 */

"use strict";

// Dependencies
var configs = require('./config.json');
var env = process.env.NODE_ENV || 'test';
var config = configs[env];  

//Fill all configs, see config.json
Object.keys(config).forEach((key) => {
  process.env[key] = config[key];
});


//Fill all logs collors
  process.env['BLACK_COLOR'] = '\x1b[30m%s\x1b[0m';
  process.env['RED_COLOR'] = '\x1b[31m%s\x1b[0m';
  process.env['GREEN_COLOR'] = '\x1b[32m%s\x1b[0m';
  process.env['YELLOW_COLOR'] = '\x1b[33m%s\x1b[0m';
  process.env['BLUE_COLOR'] = '\x1b[34m%s\x1b[0m';
  process.env['MAGENTA_COLOR'] = '\x1b[35m%s\x1b[0m';
  process.env['CYAN_COLOR'] = '\x1b[36m%s\x1b[0m';
  process.env['WHITE_COLOR'] = '\x1b[37m%s\x1b[0m';

//logs
console.log(process.env.GREEN_COLOR, "The enviroment loaded is " + process.env.NODE_ENV);
