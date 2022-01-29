
"use strict";

/* METHOD RELATIONSHIP LOADER
 * This program load CSV files into Redis with all relationship between methods, it is based on several CSV or any repository.  *        
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
const { SSL_OP_PKCS1_CHECK_1 } = require("constants");

//CONST to USE: THE CONFIG. (TODO: extract config in a file)
const toLoad = {

    //UNNECESSARY TO LOAD
    CA_CA: { doc: 'UnificacionInterface_AC_X_AC.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3 }, //it doesn't have methods, We don't need to load with prefix nm_
    CA_SI: { doc: 'UnificacionInterface_SI_X_AC.csv', Col1: 0, Col2: 1, Col3: 3, Col4: 4 }, //it doesn't have methods, We don't need to load with prefix nm_
    SI_SI: { doc: 'UnificacionInterface_SI_X_SI.csv', Col1: 0, Col2: 1, Col3: 3, Col4: 4 }, //it doesn't have methods, We don't need to load with prefix nm_ 
    SI_SN: { doc: 'UnificacionInterface_SN_X_SI.csv', Col1: 0, Col2: 1, Col3: 3, Col4: 4 }, //it doesn't have methods, We don't need to load with prefix nm_

    //NECESSARY TO LOAD
    SI_SNBE: { doc: 'UnificacionInterface_SI_X_SNBE.csv', Col1: 0, Col2: 1, Col3: 4, Col4: 6 }, //it doesn't have methods, We need to load with prefix nm_ but NO SI's
    SNBE_SNBE: { doc: 'UnificacionInterface_SNBE_X_SNBE.csv', Col1: 2, Col2: 2, Col3: 0 },  //it doesn't have methods
    SNBE_BE: { doc: 'UnificacionInterface_BE_X_SNBE.csv', Col1: 2, Col2: 0 }, //it doesn't have methods, We need to load with prefix nm_
    BE_DB: { doc: 'IDE90146.G0N15_new3.csv', Col1: 5, Col2: 0 }, //it doesn't have methods, We need to load with prefix nm_    
    BE_DS: { doc: 'configuracio_datasource.csv', Col1: 0, Col2: 3 },
    BE_CLOUD: { doc: 'UnificacionInterface_BE_X_CLOUD.csv', Col1: 0, Col2: 1 },   //it doesn't have methods, We need to load with prefix nm_   
    ADS_SA: { doc: 'UnificacionInterface_SN_X_SA.csv', Col1: 1, Col2: 0 },  //it doesn't have methods, We need to load with prefix nm_
    XMLAPP_PNPE: { doc: 'XMLAPP_PNPE.csv', Col1: 0, Col2: 1, Col3: 3 },  //it doesn't have methods, We need to load with prefix nm_
    PNPE_SI: { doc: 'PNPE.20210608184210548000.csv', Col1: 0, Col2: 2, Col3: 6 },  //it doesn't have methods
    PNPE_SI2: { doc: 'PNPE.20210721083938704000.csv', Col1: 0, Col2: 2, Col3: 6 },  //it doesn't have methods
    SI_ADS_SA_TX: { doc: 'UnificacionInterface_SI_TX.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3, Col5: 4 },   //Exist methods in SI. We need to load correctly with prefix nm_
    CORRECTIONS: { doc: 'CORRECTIONS.csv', Col1: 0, Col2: 1 }
};

//LOAD CONST
const PATH = './csv/interfaces/';
const NORMAL_ME = 'nm_';
const REVERSE_ME = 'rm_';


//VARS
var notProcessed = 0;
var areProcessed = 0;

//REDIS CONFIG & INITIALITATION
//const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
const client = redis.createClient({ host: '127.0.0.1', port: '6379' });;
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
            loadCSV_SNBE(toLoad.SI_SNBE),
            loadCSV_2SNBE(toLoad.SNBE_SNBE),
            loadCSV_BE(toLoad.SNBE_BE),
            loadCSV_DB(toLoad.BE_DB),
            loadPNPE_SI(toLoad.PNPE_SI),
            loadPNPE_SI(toLoad.PNPE_SI2),
            loadXMLAPP_PNPE(toLoad.XMLAPP_PNPE),
            loadSI_ADS_SA_TX(toLoad.SI_ADS_SA_TX),
            loadCSV_ADS_SA(toLoad.ADS_SA) //unnecessary because we loaded in components

        ]).then(() => {
            console.log('\x1b[33m', '------------MethodLoader: First: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save. Continue next step------------');
        }).catch(error => console.log(`Error in executing ${error}`));

    await loadCSV_CORRECTIONS(toLoad.CORRECTIONS);
    await loadCSV_DS(toLoad.BE_DS);  //We have to execute after loadCSV_DB
    console.log('\x1b[32m', '------------Finish MethodLoader: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save.------------');

    //client.quit();
    //process.exit(1);

}






/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/


//loadCSV_SNBE function, SNBE CSV Loader.
const loadCSV_SNBE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                //let component1 = row[params.Col1] + '.' + row[params.Col2]; //NO LOAD SI's
                let component2 = 'SN.MCA.' + row[params.Col3];
                let component3 = 'BE.' + row[params.Col4];
                //client.sadd(NORMAL_ME + component1, component2);
                //client.sadd(REVERSE_ME + component2, component1);
                client.sadd(NORMAL_ME + component2, component3);
                client.sadd(REVERSE_ME + component3, component2);
                //console.log(`ROW=${JSON.stringify(row)}`)

                //BE Pure query -> PRQ
                saveBEIfIsPRQ(component3);


            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV_2SNBE function, SNBE Loader.
const loadCSV_2SNBE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = 'SN.MCA.' + row[params.Col1];
                let component2 = 'SN.MCA.' + row[params.Col2];
                let component3 = 'BE.' + row[params.Col3];
                if (component1 != component2) {
                    client.sadd(NORMAL_ME + component1, component2);
                    client.sadd(REVERSE_ME + component2, component1);
                }
                client.sadd(NORMAL_ME + component2, component3);
                client.sadd(REVERSE_ME + component3, component2);

                //BE Pure query -> PRQ
                saveBEIfIsPRQ(component3);

                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV_BE function, BE Loader.
const loadCSV_BE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = 'SN.MCA.' + row[params.Col1];
                let component2 = 'BE.' + row[params.Col2];
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);

                //BE Pure query -> PRQ
                saveBEIfIsPRQ(component2);

                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}




//loadCSV_DB function, DB Loader.
const loadCSV_DB = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = ('BE.' + row[params.Col1]).toUpperCase();
                let component2 = ('DB.' + row[params.Col2]).toUpperCase();
                //if (component2 == 'DB.DBE1') component2 = "DB.DBE1"; We don't have *PRQ in this file            
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);
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
                let charsInit = component1.substring(0, 3);


                //if (component2 == 'DB.DBE1') component2 = "DB.DBE1"; We don't have *PRQ in this file
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);
                //remove empty transaction.
                if (charsInit == 'ADS.') {
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

//loadCSV_DS function, DB Loader.
const loadCSV_DS = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component1 = 'BE.' + row[params.Col1];
                let component2 = ('DB.' + row[params.Col2]).toUpperCase();
                let index = component2.indexOf("_");
                if (index > 0) component2 = component2.substring(0, index);
                let arrayComponents = await getAllComponents(NORMAL_ME + component1);
                if (arrayComponents.length == 0) {  //We save only if we don't have the DB. 
                    //console.log(component1 + " -> " + component2);
                    client.sadd(NORMAL_ME + component1, component2);
                    client.sadd(REVERSE_ME + component2, component1);
                }
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadPNPE_SI function, SA Loader.
const loadPNPE_SI = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = 'PNPE.' + row[params.Col1].trim().replace(/\W/g, '') + row[params.Col2];
                let component2 = row[params.Col3];
                if (component2.trim() != '') {
                    let method;
                    let index = component2.indexOf('/');
                    if (index > 0) method = component2.substring(index + 1, component2.length); // save method name

                    index = component2.indexOf('.');
                    if (index > 0) {
                        component2 = component2.substring(0, index);  //if have .version we catch only  left part
                        let componentLength = component2.length
                        let existWeb = component2.substring(componentLength - 3, componentLength);
                        if (existWeb == "Web") component2 = component2.substring(0, componentLength - 3);
                    }
                    component2 = 'SI.MCA.' + component2;
                    if (method) {
                        component2 = component2 + '.' + lowFirstLetter(method);
                        index = component2.indexOf('/');
                        if (index > 0) component2 = component2.substring(0, index).trim();
                        index = component2.indexOf('(');
                        if (index > 0) component2 = component2.substring(0, index).trim();
                        index = component2.indexOf(' ');
                        if (index > 0) component2 = component2.substring(7, component2.length).trim(); //it's a PRESTACiÓ , remove the 'SI.MCA.' initial.

                        client.sadd(NORMAL_ME + component1, component2);
                        client.sadd(REVERSE_ME + component2, component1);
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

//loadXMLAPP_PNPE function, SA Loader.
const loadXMLAPP_PNPE = async function (params) {
    return new Promise((resolve, reject) => {
        let regex = new RegExp('/', 'g');
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = "XMLAPP" + row[params.Col1];
                component1 = component1.replace(regex, '.');
                let component2 = 'PNPE.' + row[params.Col2].trim().replace(/\W/g, '') + row[params.Col3];
                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);
                //console.log(`ROW=${JSON.stringify(row)}`)
                //console.log(component1 + " : " + component2 );
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}




//loadSI_ADS_SA_TX function, SA Loader.
const loadSI_ADS_SA_TX = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = row[params.Col1];
                let method = lowFirstLetter(row[params.Col2]);
                let index = component1.indexOf(".", 8);
                if (index > 0) component1 = component1.substring(0, index) + '.' + method;
                let component2 = row[params.Col3];  // "=>SI.MCA.AlfabeticPersonaMultiCanal.9.3.1=>SN.MCA.AlfabeticPersonaMoSenyLOPD.2.1.2"
                component2 = component2.substring(2, component2.length); //delete => initial
                let component3 = 'ADS.' + row[params.Col4];
                let component4 = 'TX.' + row[params.Col5]; //it can be empty
                let indexOf2Components = component2.indexOf("=>");
                if (indexOf2Components > 0) {  //We have 2 components in this row
                    let component2_2 = component2.substring(indexOf2Components + 2, component2.length);
                    component2 = component2.substring(0, indexOf2Components);
                    let index2 = component2.indexOf(".", 8);
                    if (index2 > 0) component2 = component2.substring(0, index2);
                    let index3 = component2_2.indexOf(".", 8);
                    if (index3 > 0) component2_2 = component2_2.substring(0, index3);
                    if (component2.substring(0, 3) != 'SI.') { // we cannot safe SI's without method in loadMethod.
                        client.sadd(NORMAL_ME + component1, component2);
                        client.sadd(REVERSE_ME + component2, component1);
                        client.sadd(NORMAL_ME + component2, component2_2);
                        client.sadd(REVERSE_ME + component2_2, component2);
                    }
                    if (component2_2.substring(0, 3) != 'SI.') { // we cannot safe SI's without method in loadMethod.
                        client.sadd(NORMAL_ME + component2_2, component3);
                        client.sadd(REVERSE_ME + component3, component2_2);
                    }
                    client.sadd(NORMAL_ME + component3, component4);
                    client.sadd(REVERSE_ME + component4, component3);
                    if (component4 != 'TX.') {
                        client.srem(NORMAL_ME + component3, 'TX.'); //remove empty transaction.
                        client.srem(REVERSE_ME + 'TX.', component3); //remove empty transaction.   
                    }
                } else {  //We have Only 1 component in this row
                    let index2 = component2.indexOf(".", 8);
                    if (index2 > 0) component2 = component2.substring(0, index2);
                    if (component2.substring(0, 3) != 'SI.') { // we cannot safe SI's without method in loadMethod.
                        client.sadd(NORMAL_ME + component1, component2);
                        client.sadd(REVERSE_ME + component2, component1);
                        client.sadd(NORMAL_ME + component2, component3);
                        client.sadd(REVERSE_ME + component3, component2);
                    }
                    client.sadd(NORMAL_ME + component3, component4);
                    client.sadd(REVERSE_ME + component4, component3);
                    if (component4 != 'TX.') {
                        client.srem(NORMAL_ME + component3, 'TX.'); //remove empty transaction.
                        client.srem(REVERSE_ME + 'TX.', component3); //remove empty transaction.   
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

//loadCSV_ADS_SA function, SA Loader.
const loadCSV_ADS_SA = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = 'ADS.' + row[params.Col1];
                let component2 = 'SA.' + row[params.Col2];
                //client.sadd(NORMAL_ME + component1, component2); Because we don't want normal order
                client.sadd(REVERSE_ME + component2, component1);
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
function lowFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


/* ******************************
 * REDIS FUNCTIONS , they ar into promises
 ********************************/
//getAllComponents function, search components in Redis. 
const getAllComponents = async function (component) {
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
const saveBEIfIsPRQ = async function (component) {
    //BE Pure query -> PRQ
    if (component.lastIndexOf("PRQ") == 6) {
        client.sadd(NORMAL_ME + component, "DB.DBE1");
        client.sadd(REVERSE_ME + "DB.DBE1", component);
    }
}


//getCost function, this method gets cost value from Redis, it's a promise. 
const getCost = async (name) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        client.get(name, (error, result) => { //get the value of hash                   
            if (error) reject(error);  //if redis give me an error.  If we used reject the try/catch would be unnecessary here
            else resolve(result); // everything is OK, return result                                
        });
    });
    //.then((result) => { return result; })  //return the result value 
    //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}/* ******************************
 * INIT CALL
 ********************************/

//init();
module.exports = { init }