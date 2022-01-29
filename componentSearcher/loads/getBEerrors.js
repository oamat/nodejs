"use strict";

/*
 * This program load CSV files and try to encounter errors:  components that no have relations *        
 *  * It is 100% async and we use promises. 
 *  * The program load each relation with Sets (CA <-> SI, SI <-> SN, SN <-> BE, BE <-> DB,... 
 */

/* ******************************
 * CONST & VARS 
 ********************************/
//DEPENDENCIES
const redis = require("redis");
const fs = require('fs');
const { writeToPath } = require('@fast-csv/format');
const csv = require('@fast-csv/parse');
const path = require('path');

//CONST to USE: THE CONFIG. (TODO: extract config in a file)
const toLoad = {       
    SI_SNBE: { doc: 'UnificacionInterface_SI_X_SNBE.csv', Col1: 0, Col2: 1, Col3: 4, Col4: 6 },
    SNBE_SNBE: { doc: 'UnificacionInterface_SNBE_X_SNBE.csv', Col1: 2, Col2: 2, Col3: 0 },
    SNBE_BE: { doc: 'UnificacionInterface_BE_X_SNBE.csv', Col1: 2, Col2: 0 },
    //BE_DB: { doc: 'IDE90146.G0N15_old.csv', Col1: 8, Col2: 3 },
    BE_DB: { doc: 'IDE90146.G0N15_new3.csv', Col1: 5, Col2: 0 },
    BE_DS: { doc: 'configuracio_datasource.csv', Col1: 0, Col2: 3 },
    BE_CLOUD: { doc: 'UnificacionInterface_BE_X_CLOUD.csv', Col1: 0, Col2: 1 },    
};

//LOAD CONST
const PATH = './csv/interfaces/';
const NORMAL = 'n_';
const NORMAL_BC = 'cn_';

var colums;
var arrayOfArraysBEWithoutDB = [];
var arrayOfArraysBEWithoutBC = [];
var setBEWithoutDB = new Set();
var setBEWithoutBC = new Set();

//REDIS CONFIG & INITIALITATION
//const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
const client = redis.createClient({ host: '127.0.0.1', port: '6379' });
client.on("error", function (error) {  //little test
    console.error(error);
});

/* ******************************
 * INIT PROGRAM
 ********************************/
//init function, calls all CSV load method methods. 
const init = async function () {
    const promises = [
        loadCSV_SNBE(toLoad.SI_SNBE),
        loadCSV_2SNBE(toLoad.SNBE_SNBE),
        loadCSV_BE(toLoad.SNBE_BE),
        loadCSV_DB(toLoad.BE_DB),
        loadCSV_CLOUD(toLoad.BE_CLOUD),
        loadCSV_DS(toLoad.BE_DS)
        
    ];
    await Promise.all(promises)
        .then(() => {
            console.log('\x1b[32m', '------------All files are Checked correctly on Redis------------');
        }).catch(error => console.log(`Error in executing ${error}`));



    //arrayOfArraysBEWithoutDB = Array.from(setBEWithoutDB);
    //arrayOfArraysBEWithoutBC = Array.from(setBEWithoutBC);

    for (let item of setBEWithoutDB) {
        arrayOfArraysBEWithoutDB.push({ 0: item });
    }

    for (let item of setBEWithoutBC) {
        arrayOfArraysBEWithoutBC.push({ 0: item });
    }

    colums = { '0': '0' };

    console.log('\x1b[36m', arrayOfArraysBEWithoutDB.length + ' empty DB found. Saving in ./results/DB.csv file.');
    let result = await saveSearchToCSV('BEWithoutDB', arrayOfArraysBEWithoutDB);

    console.log('\x1b[36m', arrayOfArraysBEWithoutBC.length + ' empty DB found. Saving in ./results/DB.csv file.');
    let result2 = await saveSearchToCSV('BEWithoutBC', arrayOfArraysBEWithoutBC);

    //client.quit();
    process.exit(1);


}


/* ******************************
 * Write CSV FUNCTION , they ar into promises
 ********************************/

//getAllComponents function, search components in Redis. 
const saveSearchToCSV = async function (component, array) {
    return new Promise((resolve, reject) => {
        array.unshift(colums); //Prepare Headers For CSV: headers:true not work if first is less than others. 
        //console.log(array);
        writeToPath(path.resolve('./results/', component + '.csv'), array, { delimiter: ';' }) //get result or error
            /*try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                 if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject   */
            .on('error', async err => {
                console.error(err);
                reject(error);
            })
            .on('finish', () => {
                console.log('\x1b[36m', ' ./results/' + component + '.csv writing.')
                resolve(component);
            });
    });
}

/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/
//loadCSV_DB function, DB Loader.
const loadCSV_DB = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col1];
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
            })
            .on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}

//loadCSV_DS function, BE -  DB Loader.
const loadCSV_DS = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col1];             
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
            })
            .on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}

//loadCSV_CLOUD function, BE ->BC Cloud Loader.
const loadCSV_CLOUD = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col1];
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);                
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
            }).on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}


//loadCSV_SNBE function, SNBE CSV Loader.
const loadCSV_SNBE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col4];
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
            }).on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}

//loadCSV_2SNBE function, SNBE Loader.
const loadCSV_2SNBE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col3];
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}

//loadCSV_BE function, BE Loader.
const loadCSV_BE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = 'BE.' + row[params.Col2];
                let result = await getAllComponents(NORMAL + component);
                let result2 = await getBC(NORMAL_BC + component);
                if (result == null || result == '') setBEWithoutDB.add(component);
                if (result2 == null) setBEWithoutBC.add(component);
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => { console.log('\x1b[36m', `Checked ${rowCount} rows from ${params.doc}`); resolve(true); });
    });
}

/* ******************************
 * REDIS FUNCTIONS , they ar into promises
 ********************************/
//getAllComponents function, search components in Redis. 
const getAllComponents = async (component) => {
    return new Promise((resolve, reject) => {
        client.smembers(component, (error, result) => { //get result or error
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here.
}


//getBC function, this method gets cost of Redis and prepare component value. 
const getBC = async (name) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        client.get(name, (error, result) => { //get the value of hash                   
            if (error) reject(error);  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
            else resolve(result); // everything is OK, return result , even if si null.                                
        });
    })
        .then((result) => { return result; })  //return the result value of property hash contract
        .catch((error) => { console.log(error.message) }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

init();