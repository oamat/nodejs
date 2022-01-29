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

/* ******************************
 * BEFORE ALL: LOAD & SEARCHERS
 ********************************/

/* before("CRSearcher batch tests using CHAI module: ", async function () {
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
}); */


/* ******************************
 * TEST ALL RESULTS
 ********************************/

describe("TEST - CHECK SIZE FILES BATCH OUTPUT FILES (all components) ", function () {

    it("Check BEs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/BEs/BEsOutputFile.csv"), getFilesizeInBytes("./results/outputs/BEsOutputFile.csv"));
    });

    it("Check CAs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/CAs/CAsOutputFile.csv"), getFilesizeInBytes("./results/outputs/CAsOutputFile.csv"));
    });

    it("Check DBs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/DBs/DB.OutputFile.csv"), getFilesizeInBytes("./results/outputs/DB.OutputFile.csv"));
    });

    it("Check Palancas Bankia Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/PalancasBankia/PalancasOutputFile.csv"), getFilesizeInBytes("./results/outputs/PalancasOutputFile.csv"));
    });


    it("Check PRQs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/PRQs/PRQsOutputFile.csv"), getFilesizeInBytes("./results/outputs/PRQsOutputFile.csv"));
    });

    it("Check SEs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SEs/SEsOutputFile.csv"), getFilesizeInBytes("./results/outputs/SEsOutputFile.csv"));
    });

    it("Check SIs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SIs/TransferenciasInmediatasOutputFile.csv"), getFilesizeInBytes("./results/outputs/TransferenciasInmediatasOutputFile.csv"));
    });

    it("Check SNs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SNs/SNsOutputFile.csv"), getFilesizeInBytes("./results/outputs/SNsOutputFile.csv"));
    });


    it("Check TXs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/TXs/TLE-TX.OutputFile.csv"), getFilesizeInBytes("./results/outputs/TLE-TX.OutputFile.csv"));
    });


    it("Check XMLAPPs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/XMLAPPs/XMLAPPsOutputFile.csv"), getFilesizeInBytes("./results/outputs/XMLAPPsOutputFile.csv"));
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
const loadConf = async function () { //DON'T CHANGE ORDER        
    let conf;
    if (JSONConfigFile) {
        if (fs.existsSync(JSONConfigFilePath)) {
            conf = JSON.parse(fs.readFileSync(JSONConfigFilePath, 'utf8'));
        } else {
            console.log('\x1b[31m', ' File init.json not found: ' + JSONConfigFilePath);
            exit(1);
        }
    } else {
        conf = { RedisIP: '127.0.0.1', RedisPort: '6379' }; //by default.
    }


    if (conf.RedisPort && conf.RedisIP) {
        return (conf);
    } else {
        console.log('\x1b[31m', ' RedisIP or RedisPort not found in ' + JSONConfigFilePath);
        exit(1);
    }



}