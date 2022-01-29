
"use strict";

/* Components RELATIONSHIP LOADER
 * This program load CSV files into Redis with all relationship between components, it is based on several CSV or any repository.  *        
 *  * It is 100% async and we use promises. 
 *  * The program load each relation with Sets (CA <-> SI, SI <-> SN, SN <-> BE, BE <-> DB,... 
 */

/* ******************************
 * CONST & VARS 
 ********************************/
//DEPENDENCIES
const redis = require("redis");
const fs = require('fs');
const csv = require('@fast-csv/parse');

//CONST to USE: THE CONFIG. (TODO: extract config in a file)
const toLoad = {
    MODULE_TABLE: { doc: 'module.Tables.csv', Col1: 0, Col2: 2 },
    MODULE_PSB: { doc: 'module.PSB.csv', Col1: 0, Col2: 1 },
};

//LOAD CONST
const PATH = './csv/HOST/';
const NORMAL = 'n_';
const REVERSE = 'r_';
const NORMAL_ME = 'nm_';
const REVERSE_ME = 'rm_';
const NORMAL_COMPMEHOD = "ncom_"; //for DB search

//VARS
var notProcessed = 0;
var areProcessed = 0;

var arrayOfTableByModule = [];

//REDIS CONFIG & INITIALITATION
//const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
const client = redis.createClient({ host: '127.0.0.1', port: '6379' });
client.on("error", function (error) {  //little test
    console.error(error);
});

/* ACCESS TEST REDIS
client.set("key", "value", redis.print);
client.get("key", redis.print); 
END  ACCESS TEST REDIS*/

/* ******************************
 * INIT PROGRAM
 ********************************/
//init function, calls all CSV load method methods. 
const init = async function () {

    await loadCSV_ModuleTable(toLoad.MODULE_TABLE);

    await loadCSV_ModulePSB(toLoad.MODULE_PSB),




        console.log('\x1b[32m', '------------Finish ComponentsLoader: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save.------------');

    //client.quit();
    //process.exit(1);
}

/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/

//loadCSV function, generic CSV Loader.
const loadCSV_ModuleTable = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {

                let module = row[params.Col1].trim();
                let table = row[params.Col2].trim();

                if (table.substring(3, 4) == 'T') {
                    table = 'TA.' + table;

                    if (arrayOfTableByModule[module] == null) arrayOfTableByModule[module] = new Set(); //save relation Module-table

                    arrayOfTableByModule[module].add(table); //save table inside module
                    //console.log(table);
                }

                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV function, generic CSV Loader.
const loadCSV_ModulePSB = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {

                let module = row[params.Col1].trim();
                let psb = 'PSB.' + row[params.Col2].trim();

                if (arrayOfTableByModule[module] != null) {
                    for (let table of arrayOfTableByModule[module]) { //iterate tables inside module 
                        client.sadd(NORMAL + psb, table);
                        client.sadd(REVERSE + table, psb);
                        client.sadd(NORMAL_ME + psb, table);
                        client.sadd(REVERSE_ME + table, psb);
                        saveForSearch(table); //For TX
                        saveForSearch(psb); //For PSB
                    }
                }
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}



/* ******************************
 * UTIL FUNCTIONS
 ********************************/

//saveForSearch function, search components in Redis. 
const saveForSearch = async function (component, ini = 4) {
    let max = component.length - 1;
    for (let i = ini; i <= max; i++) {
        //console.log(db.substring(0, i) + " : " + i);
        client.sadd(NORMAL_COMPMEHOD + component.substring(0, i), component); //We Save all the methods of component. 
    }
}


/* ******************************
 * INIT CALL
 ********************************/
//init();
module.exports = { init }