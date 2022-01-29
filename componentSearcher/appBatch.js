"use strict";
/*
 * This program search a relationship between components, it is based on several CSV or any repository and a batch with load components into Redis is needed (load.js).  *        
 *  * The global array 'arrayOfArrays' is a multidimensional array with values similar than { 1: 'CA.OFI.Component4' , 2: 'SI.MCA.Component4' , 3: 'SN.MCA.Component6', 4: 'BE.DECDEC', 5: 'DECO02P' }
 *      1.Comand Line Interface (Prompt) with the options that user can choose. 
 *      2.Recursives methods for searching components using Redis and save them in json.
 *      3.When is appropiate we push to 'arrayOfArrays'.
 *      4.At the end of everything we print results on screen or in a file. 
 */
/* ******************************
 * CONFIG INPUT PARAMS
 ********************************/
//EXTERNAL FILECONFIG? init.json
const JSONConfigFile = true; // define if the JSON init file is external: ./init.json
const JSONConfigFilePath = './init.json'; // define path if the JSON config file is external: config.json

//EXCUTING CONFIG PARAMS. (TODO: extract config in a file)
var config = {
    //1.INPUT     
    inputWithCSV: true, //we get file inputs from /results/input/[filename].csv? 
    fileInputCSV: './results/inputs/PalancasBankia/PalancasInputFileNew.csv', //if 'inputWithCSV: true' file input name, Only in case inputWithCSV = true; e.g. 'palancas.csv', 'TLE.TX.csv'
    arrayInputs: [{ component: 'BE.ARQRUN', description: 'Demos ARQ' }, { component: 'BE.CEFLEX', description: 'Buscador Felxible' }],  //if 'inputWithCSV: false' you have to define this array with JSON array [ { component: 'x', description: 'y' }, ... ] 

    palancasMitigacion: true, //SPECIFIC CXB : is the file specific of CaixaBank Palancas Mitigación?
    addTypeToComponent: '', //SPECIFIC CXB : If you need to define the component type because input file don't have the component type. e.g: 'TX.', 'ADS.', 'SN.'. it can be empty '' if doesn't need.


    //2.SEARCH TYPE
    levelSearch: 20, //level search, e.g. if you want the first SI from BE you only need 3 levels (BE->SN->SI), it's unnecessary to search more. 
    order: true, //it is the order of search : true = normal (XMLAPP->PNPE/CA/SE->SI->SN->BE/ADS->DB), false = reverse (DB->BE/ADS->SN->SI->PNPE/CA/SE->XMLAPP)
    skipSI: false, //if you want to Skip the SI layer, sometimes it can be wide.
    componentTypeToSearch: 0, //Filter type, see choices constant for more info -> See const choices -> e.g '0 is all components'
    searchMethod: 0, //Component with operation? 0 with Method, 1 WithoutMethod, 2 Only Method reference
    withCostOfComponent: true, //Do you want the cost of component? hits and hits*averageTime

    //3.OUTPUT  
    outputAllInOneCSV: true, //true : all in 1 file, false: Every component to search in a different CSV
    outputCSVName: 'PalancasOutputFile.csv', //Only in case outputAllInOneCSV = true, if not we create a file per component with component name

    //4.ABSIS ARQ IDEINS DEACTIVATION, only if you want deactivate ABSIS Operations
    outputIDEINSFile: false,  //Specific of ABSIS: if you want generate a IDEINS file for deactivation components
    deactivationTypeComponent: 'SI1',  //Specific of ABSIS: if you want generate a IDEINS file for deactivation components, CA,SI or SN requires CA1,SI1 or SN1
    outputCSVNameIDEINS: 'PalancasOutputFileIDEINS_SN1.csv', //Specific of ABSIS: define the name of outputFile
    outputComponentWithOperation: false //Specific of ABSIS: deactivate operation component IDEINS, Only for CAs, SIs and SNs if searchMethod is 0 (with method).

};


/* ******************************
 * DEPENDENCIES
 ********************************/
//DEPENDENCIES
const fs = require('fs');
const { exit } = require('process');
//MY DEPENDENCIES CODES
const batch = require('./app/batch');


/* ******************************
 * INIT LOAD PROGRAM 
 ********************************/

//init batch function
const init = async function () { //DON'T CHANGE ORDER
    console.log('\x1b[32m', 'Starting Batch...');
    let initConf;
    if (JSONConfigFile) {
        if (fs.existsSync(JSONConfigFilePath)) {
            initConf = JSON.parse(fs.readFileSync(JSONConfigFilePath, 'utf8'));

            if (initConf.JSONConfigFile) {
                if (initConf.JSONConfigFilePath && (typeof initConf.JSONConfigFilePath === 'string' || initConf.JSONConfigFilePath instanceof String)) {
                    if (fs.existsSync(initConf.JSONConfigFilePath)) {
                        config = JSON.parse(fs.readFileSync(initConf.JSONConfigFilePath, 'utf8'));
                    } else {
                        console.log('\x1b[31m', 'File not found: ' + initConf.JSONConfigFilePath);
                        exit(1);
                    }
                } else {
                    console.log('\x1b[31m', ' File initConf.json bad format : ' + JSONConfigFilePath);
                    exit(1);
                }
            }
        } else {
            console.log('\x1b[31m', ' File initConf.json not found: ' + JSONConfigFilePath);
            exit(1);
        }
    } else {
        initConf = { RedisIP:'127.0.0.1', RedisPort:'6379' }; //by default. 
    }
    if (initConf.RedisPort && initConf.RedisIP) {
        config.RedisIP = initConf.RedisIP;
        config.RedisPort = initConf.RedisPort;
        let rows = await batch.batchInit(config);
        console.log('\x1b[32m', 'FINISH Batch : total rows generated in file => ' + rows);
        exit(0);
    } else {
        console.log('\x1b[31m', ' RedisIP or RedisPort not found in ' + JSONConfigFilePath);
        exit(1);
    }

}

/* ******************************
 * INIT CALL
 ********************************/
init();