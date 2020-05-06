
/*
 * Monitor program
 *   This programs helps to search the state of a SMS o PNS notify via SSH, BBDD, etc 
 */

"use strict";

// Dependencies
require('./config.js');
const ask = require('./ask_oasis.js');
var response = {};
const servers = process.env.SERVERS.split(',');



/*  **********
 *   METHODS
 *  ********** 
 */




// Init method
const init = async () => {
    response = await ask.getResponse();
    console.log(response);
    console.log(servers);
}

//Init program
init();
















