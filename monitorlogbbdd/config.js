/*
 * Load all Configurations
 *         see configs.json for all configsurations X enviroment
 *
 */

"use strict";

// Dependencies
const configs = require('./config.json');

//default env
const defaultENV = 'development';

//if exist preloaded env in NODE_ENV
var env = process.env.NODE_ENV || defaultENV;

//load env of config.json
var config = configs[env];
if (!config) {  //If config[env] doesn't exist we change env to 'development'
  env = defaultENV;
  config = configs[env];
}

//load all configs to process.env
Object.keys(config).forEach((key) => {  //Fill all configs, see config.json
  process.env[key] = config[key];
});


//load all console.log colors
process.env['BLACK_COLOR'] = '\x1b[30m%s\x1b[0m';
process.env['RED_COLOR'] = '\x1b[31m%s\x1b[0m';
process.env['GREEN_COLOR'] = '\x1b[32m%s\x1b[0m';
process.env['YELLOW_COLOR'] = '\x1b[33m%s\x1b[0m';
process.env['BLUE_COLOR'] = '\x1b[34m%s\x1b[0m';
process.env['MAGENTA_COLOR'] = '\x1b[35m%s\x1b[0m';
process.env['CYAN_COLOR'] = '\x1b[36m%s\x1b[0m';
process.env['WHITE_COLOR'] = '\x1b[37m%s\x1b[0m';
//final load all console.log colors

//basic testing
console.log(process.env.GREEN_COLOR, process.env.comment + env);
