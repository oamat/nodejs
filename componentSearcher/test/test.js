"use strict";

/*
 * This program test search a relationship between components, it is based on several CSV or any repository and a batch with load components into Redis is needed (load.js).  *        
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
const csv = require('@fast-csv/parse');
var assert = require('assert');
//MY DEPENDENCIES CODES
const batch = require('../app/batch');

//EXTERNAL FILECONFIG? init.json
const JSONConfigFile = true; // define if the JSON init file is external: ./init.json
const JSONConfigFilePath = './init.json'; // define path if the JSON config file is external: config.json

//APP COSNT & VAR
var initConf;
const EXECS = 10;
var searchs = 0;
var BEsRows = 0;
var CAsRows = 0;
var DBsRows = 0;
var PRQsRows = 0;
var PalancasBankiaRows = 0;
var SEsRows = 0;
var SIsRows = 0;
var SNsRows = 0;
var TXsRows = 0;
var XMLAPPsRows = 0;

/* ******************************
 * BEFORE ALL: LOAD & SEARCHERS
 ********************************/

before("CRSearcher batch tests using CHAI module: ", async function () {
    initConf = await loadConf();
    BEsRows = await searchComponent("./results/inputs/BEs/config.json");
    CAsRows = await searchComponent("./results/inputs/CAs/config.json");
    DBsRows = await searchComponent("./results/inputs/DBs/config.json");
    PalancasBankiaRows = await searchComponent("./results/inputs/PalancasBankia/config.json");
    PRQsRows = await searchComponent("./results/inputs/PRQs/config.json");
    SEsRows = await searchComponent("./results/inputs/SEs/config.json");
    SIsRows = await searchComponent("./results/inputs/SIs/config.json");
    SNsRows = await searchComponent("./results/inputs/SNs/config.json");
    TXsRows = await searchComponent("./results/inputs/TXs/config.json");
    XMLAPPsRows = await searchComponent("./results/inputs/XMLAPPs/config.json");
});


/* ******************************
 * TEST ALL RESULTS
 ********************************/  

describe("TEST - CHECK LINES BATCH OUTPUT FILES (all components) ", function () {

    it("Search total executions (Orig-red, New-green) ", async function () {
        assert.equal(EXECS, searchs);
    });


    it("Check BEs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/BEs/BEsOutputFile.csv");
        assert.equal(rows, BEsRows);       
    });

    it("Check CAs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/CAs/CAsOutputFile.csv");
        assert.equal(rows, CAsRows);        
    });

    it("Check DBs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/DBs/DB.OutputFile.csv");
        assert.equal(rows, DBsRows);        
    });

    it("Check Palancas Bankia Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/PalancasBankia/PalancasOutputFile.csv");
        assert.equal(rows, PalancasBankiaRows);        
    });


    it("Check PRQs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/PRQs/PRQsOutputFile.csv");
        assert.equal(rows, PRQsRows);       
    });

    it("Check SEs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SEs/SEsOutputFile.csv");
        assert.equal(rows, SEsRows);        
    });

    it("Check SIs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SIs/TransferenciasInmediatasOutputFile.csv");
        assert.equal(rows,SIsRows);        
    });

    it("Check SNs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SNs/SNsOutputFile.csv");
        assert.equal(rows, SNsRows);       
    });


    it("Check TXs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/TXs/TLE-TX.OutputFile.csv");
        assert.equal(rows, TXsRows);       
    });


    it("Check XMLAPPs Output Search Lines (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/XMLAPPs/XMLAPPsOutputFile.csv");
        assert.equal(rows, XMLAPPsRows);        
    });
});


/* ******************************
 * UTIL FUNCTIONS
 ********************************/

const searchComponent = async (fileConfig) => {
    if (fs.existsSync(fileConfig)) {
        let config = JSON.parse(fs.readFileSync(fileConfig, 'utf8')); 
        config.RedisIP = initConf.RedisIP;
        config.RedisPort = initConf.RedisPort;   
        searchs++;
        let rows = await batch.batchInit(config);
        return rows;
    } else {
        console.log('\x1b[35m', 'File not found: ' + fileConfig);
        exit(1);
    }
}

//loadCSV function, generic CSV Loader.
const loadCSV_ROWS = async function (filename) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                //console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);                
                resolve(rowCount);
            });
    });
}


function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}


/* ******************************
 * INIT LOAD PROGRAM 
 ********************************/

//init app CLI function
const loadConf= async function () { //DON'T CHANGE ORDER        
    let conf;
    if (JSONConfigFile) {
        if (fs.existsSync(JSONConfigFilePath)) {
            conf = JSON.parse(fs.readFileSync(JSONConfigFilePath, 'utf8'));           
        } else {
            console.log('\x1b[31m', ' File init.json not found: ' + JSONConfigFilePath);
            exit(1);
        }
    } else {
        conf = { RedisIP:'127.0.0.1', RedisPort:'6379' }; //by default.
    } 
    

    if (conf.RedisPort && conf.RedisIP) {       
       return (conf);
    } else {
        console.log('\x1b[31m', ' RedisIP or RedisPort not found in ' + JSONConfigFilePath);
        exit(1);
    }


    
}