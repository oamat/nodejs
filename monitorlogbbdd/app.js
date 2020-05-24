
/*
 * Monitor program
 *   This programs helps to search the state of a SMS o PNS notify via SSH, BBDD, etc 
 */

"use strict";

// LIB Dependencies
const fs = require('fs');
const _ = require('lodash');
const yargs = require('yargs');


//Project Dependencies
require('./config/config.js');
const promptOASIS = require('./prompt/oasis');
const promptOCP = require('./prompt/oasis');

const serversOASIS = process.env.SERVERS_OASIS.split(',');
const serversOCP = process.env.SERVERS_OASIS.split(',');

var response = {};

const argv = yargs
    .command('oasis', 'Search in OASIS Platform')
    .command('ocp', 'Search in OCP Platform')
    .help()
    .argv;


var command = argv._[0];

/*  **********
 *   METHODS
 *  ********** 
 */

// Init method
const init = async () => {
    argv._[0];
    response = await promptOASIS.getResponse();
    console.log(response);
    console.log(serversOASIS);
}



if (command === 'oasis') {
    //Init program
    init();
} else if (command === 'ocp') {
    //Init program
    init();
} else {
console.log('Command not recognized: use oasis or ocp :');
console.log("        node app.js oasis    Search in OASIS Platform");
console.log("        node app.js ocp      Search in OCP Platform");
console.log("        ");
console.log(" node app.js --help  Muestra ayuda"); 
}















