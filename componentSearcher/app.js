"use strict";

/*
 * This program search arelationship between components, it is based on several CSV or any repository and a batch with load components into Redis is needed (load.js).  *        
 *  * The global array 'arrayOfArrays' is a multidimensional array with values similar than { 1: 'CA.OFI.Component4' , 2: 'SI.MCA.Component4' , 3: 'SN.MCA.Component6', 4: 'BE.DECDEC', 5: 'DECO02P' }
 *      1.Comand Line Interface (Prompt) with the options that user can choose. 
 *      2.Recursives methods for searching components using Redis and save them in json.
 *      3.When is appropiate we push to 'arrayOfArrays'.
 *      4.At the end of everything we print results on screen or in a file. 
 */



/* ******************************
 * CONST & VARS 
 ********************************/
//DEPENDENCIES
const fs = require('fs');
const { exit } = require('process');
//MY DEPENDENCIES CODES
const appCLI = require('./app/app');

//EXTERNAL FILECONFIG? init.json
const JSONConfigFile = true; // define if the JSON init file is external: ./init.json
const JSONConfigFilePath = './init.json'; // define path if the JSON config file is external: config.json

/* ******************************
 * INIT LOAD PROGRAM 
 ********************************/

//init app CLI function
const init = async function () { //DON'T CHANGE ORDER    
    let initConf;
    if (JSONConfigFile) {
        if (fs.existsSync(JSONConfigFilePath)) {
            initConf = JSON.parse(fs.readFileSync(JSONConfigFilePath, 'utf8'));           
        } else {
            console.log('\x1b[31m', ' File initConf.json not found: ' + JSONConfigFilePath);
            exit(1);
        }
    } else {
        initConf = { RedisIP:'127.0.0.1', RedisPort:'6379' }; //by default.
    } 
    

    if (initConf.RedisPort && initConf.RedisIP) {       
        appCLI.init(initConf);
        //exit(0);
    } else {
        console.log('\x1b[31m', ' RedisIP or RedisPort not found in ' + JSONConfigFilePath);
        exit(1);
    }


    
}

/* ******************************
 * INIT PROGRAM
 ********************************/
init();