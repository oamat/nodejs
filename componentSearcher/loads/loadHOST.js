
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
    PSB_TX: { doc: 'sys_psb_tx.csv', Col1: 2, Col2: 1, Col3: 0 },
    ADS_TX: { doc: 'serv-tx.csv', Col1: 0, Col2: 2 },
    CORRECTIONS: { doc: 'CORRECTIONS.csv', Col1: 0, Col2: 1 },
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

    await Promise.all(
        [
            loadCSV_PSB(toLoad.PSB_TX),
            loadCSV_ADS(toLoad.ADS_TX)
        ]).then(() => {
            console.log('\x1b[33m', '------------ComponentsLoader: First: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save. Continue next step------------');
        }).catch(error => console.log(`Error in executing ${error}`));

    await loadCSV_CORRECTIONS(toLoad.CORRECTIONS);

    console.log('\x1b[32m', '------------Finish ComponentsLoader: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save.------------');

    //client.quit();
    //process.exit(1);
}

/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/
//loadCSV function, generic CSV Loader.
const loadCSV_PSB = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {

                let component1 = 'TX.' + row[params.Col1].trim(); //Always have TX name. it doesn't have empty TX. But we don't have ADS, so we cannot remove TX. empty
                let component2 = 'PSB.' + row[params.Col2].trim();
                let component3 = 'SYS.' + row[params.Col3].trim();

                //console.log( component1 + ':' + component2 + ':' + component3 );               
                if (component3 == 'SYS.EXP1' || component3 == 'SYS.EXP5') {
                    client.sadd(NORMAL + component1, component2);
                    client.sadd(REVERSE + component2, component1);
                    client.sadd(NORMAL + component2, component3);
                    client.sadd(REVERSE + component3, component2);

                    client.sadd(NORMAL_ME + component1, component2);
                    client.sadd(REVERSE_ME + component2, component1);
                    client.sadd(NORMAL_ME + component2, component3);
                    client.sadd(REVERSE_ME + component3, component2);
                }

                  
                saveForSearch(component1); //For TX
                saveForSearch(component2); //For PSB
                

                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV function, generic CSV Loader.
const loadCSV_ADS = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {

                let component1 = 'ADS.' + row[params.Col1].trim();
                let component2 = 'TX.' + row[params.Col2].trim(); //it can be empty!!


                client.sadd(NORMAL + component1, component2);
                client.sadd(REVERSE + component2, component1);
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);

                if (component2 != 'TX.') {
                    client.srem(NORMAL + component1, 'TX.'); //remove empty transaction.
                    client.srem(REVERSE + 'TX.', component1); //remove empty transaction.
                    client.srem(NORMAL_ME + component1, 'TX.'); //remove empty transaction.
                    client.srem(REVERSE_ME + 'TX.', component1); //remove empty transaction.
                }


                saveForSearch(component1, 5); //For ADS               
                saveForSearch(component2); //For TX

                //console.log( component1 + ':' + component2 + ':' + component3 );



                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV_DB function, DB Loader.
const loadCSV_CORRECTIONS = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = row[params.Col1];
                let component2 = row[params.Col2];

                client.sadd(NORMAL + component1, component2);
                client.sadd(REVERSE + component2, component1);
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);

                let charsInit = component1.substring(0, 3);
                if (charsInit == 'ADS.') {
                    saveForSearch(component1, 5); //For ADS               
                    saveForSearch(component2); //For TX
                    client.srem(NORMAL + component1, 'TX.'); //remove empty transaction.
                    client.srem(REVERSE + 'TX.', component1); //remove empty transaction.
                    client.srem(NORMAL_ME + component1, 'TX.'); //remove empty transaction.
                    client.srem(REVERSE_ME + 'TX.', component1); //remove empty transaction.          
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