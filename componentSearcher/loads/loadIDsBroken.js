
"use strict";

/* ID RELATIONSHIP LOADER
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
    RE_ME: { doc: 'RELACIONES_METODOS.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3, Col5: 5 }, //ID, 
    RE_OP: { doc: 'RELACIONES_OPERACIONES.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3, Col5: 5 },
    UN_ME: { doc: 'UnificacionInterface_METODOS.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3, Col5: 7 },
    UN_OP: { doc: 'UnificacionInterface_OPERACION.csv', Col1: 16, Col2: 0, Col3: 15, Col4: 1, Col5: 4, Col6: 7 }
};

//LOAD CONST
const PATH = './csv/relaciones_id/';
//const PATH = '../csv/test_id/';  // Search and change //console.log("# 

//CONST
const NORMAL = 'n_'; //for changeNextComponentsIfSN method, by the way is a SI
const AFECT = 'a_';
const NORMAL_ME = 'nm_';
const REVERSE_ME = 'rm_';

//APP CONST
const STRING = 'string';
const UNDEFINED = 'undefined'
const SI = 'SI';
//vars
var rowsProcessed1 = 0;
var notRelation1 = 0;
var rowsProcessed2 = 0;
var notRelation2 = 0;
var rowsProcessed3 = 0;
var notRelation3 = 0;
var rowsProcessed4 = 0;
var notRelation4 = 0;


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

    console.log('\x1b[36m', 'Initializing BROKEN IDS Relation files load....');


    await Promise.all(
        [
            //loadCSV_IDS_RE_ME(toLoad.RE_ME),
            //loadCSV_IDS_RE_OP(toLoad.RE_OP),
            loadCSV_IDS_ME(toLoad.UN_ME),
            loadCSV_IDS_OP(toLoad.UN_OP)
        ])  //First load ID'S RELATIONS
        .then((values) => {
            console.log(" CA/OP BROKEN RELATION_OPERACIONES: Rows Processed: " + rowsProcessed1 + ", Components without relation :" + notRelation1);
            console.log(" CA/OP BROKEN UNIFICACION_OPERACIONES: Rows Processed: " + rowsProcessed2 + ", Components without relation :" + notRelation2);
            console.log(" SI/SN BROKEN RELATION_METODOS: Rows Processed: " + rowsProcessed3 + ", Components without relation :" + notRelation3);
            console.log(" SI/SN BROKEN UNIFICACION_METODOS : Rows Processed: " + rowsProcessed4 + ", Components without relation :" + notRelation4);
            let rowsProcessedTotal = rowsProcessed1 + rowsProcessed2 + rowsProcessed3 + rowsProcessed4;
            console.log('\x1b[32m', '------------Finish IDSBrokenLoader: All files are loaded correctly on Redis, ' + rowsProcessedTotal + ' rows have been processed and save.------------');

            return true;
        }).catch(error => {
            console.log(`Error in executing ${error}`);
            return false;
        });

    //client.quit();
    //process.exit(1);
}


/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/
//loadCSV_IDS_RE_ME function, generic CSV Loader for SI/SN. We can have same ID's N times. FK of IDS_UN_ME (second method: it is called for first in IDS_ME)
const loadCSV_IDS_RE_ME = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {


                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed3 = rowCount;
                resolve(true);
            });
    });
}

//loadCSV_IDS_RE_OP function, generic CSV Loader for Operations-CA. We can have same ID's N times. FK of IDS_UN_ME (second method: it is called for first in IDS_OP)
const loadCSV_IDS_RE_OP = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {


                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed1 = rowCount;
                resolve(true);
            });
    });
}

//loadCSV_IDS_ME function, generic CSV Loader. We have unique ID. PK of IDS_RE_ME (first method: it calls second in IDS_RE_ME)
const loadCSV_IDS_ME = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let idStr = row[params.Col1];
                if (!isNaN(idStr)) {  //bad row we discard it
                    //catch Components
                    let componentWithoutMethod = row[params.Col2] + '.' + row[params.Col3] + '.' + row[params.Col4];
                    let component = lowFirstLetter(row[params.Col5]);

                    if (component.trim() != '') component = componentWithoutMethod + '.' + component; //Sometimes method doesn't exist
                    else component = componentWithoutMethod //Sometimes method doesn't exist


                    let arrayComponents = await getAllComponents(NORMAL_ME + component); // Final SN was loaded before with loadMethods,                    
                    if (arrayComponents.length == 0) { // relation with 1st component doesn't exist
                        notRelation4++;
                    } else {  // relation with 1st component exist, we have to check the second level: SI.method -> SN.method
                        let iterator = arrayComponents.values();
                        for (let nextComponent of iterator) { //iterate components with relationship 
                            //if (nextComponent == "SN.MCA.CCCognitivoNotif.eliminarNotificacion") console.log("Pasamos con SN.MCA.CCCognitivoNotif.eliminarNotificacion");
                            let arrayNextComponents = await getAllComponents(NORMAL_ME + nextComponent); // Final SN was loaded before with loadMethods, 
                            //if (nextComponent == "SN.MCA.CCCognitivoNotif.eliminarNotificacion") console.log("arrayNextComponents.length:" + arrayNextComponents.length);
                            if (arrayNextComponents.length == 0) { //in this case SN.method/SI.method doesn't have relation, sometimes is not true. 
                                notRelation4++;
                                let initChars = nextComponent.substring(0, 2);
                                //if (initChars != SI && initChars != 'CA' && initChars != 'SN') console.log(nextComponent);                                
                                if (initChars != SI) { //We only want SN ,SRV or BE and their relations.                                                                     
                                    //if (nextComponent == "SN.MCA.CCCognitivoNotif.eliminarNotificacion") console.log("Pasamos1:" + nextComponentWithoutMethod);
                                    changeNextComponentsIfSN(nextComponent);
                                }
                                //else {
                                //  changeNextComponentsIfSI(nextComponent);
                                //}
                            }
                        }
                    }
                }
                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed4 = rowCount;
                resolve(true);
            });
    });
}



//loadCSV_IDS_ME function, generic CSV Loader. We have unique ID. PK of IDS_RE_OP (first method: it calls second in IDS_RE_ME)
const loadCSV_IDS_OP = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {

                let idStr = row[params.Col1];
                if (!isNaN(idStr)) {  //bad row we discard it
                    let componentWithoutMethod = row[params.Col2] + '.' + row[params.Col3] + '.' + row[params.Col4];
                    let component = lowFirstLetter(row[params.Col5]);

                    if (component.trim() != '') component = componentWithoutMethod + '.' + component; //Sometimes method doesn't exist
                    else component = componentWithoutMethod //Sometimes method doesn't exist


                    let arrayComponents = await getAllComponents(NORMAL_ME + component); // Final SN was loaded before with loadMethods,                    
                    if (arrayComponents.length == 0) { // relation with 1st component doesn't exist
                        notRelation2++;
                    } else {  // relation with 1st component exist, we have to check the second level: SI.method -> SN.method
                        let iterator = arrayComponents.values();
                        for (let nextComponent of iterator) { //iterate components with relationship 
                            //if (nextComponent == "SI.MCA.CCCognitivoNotificaciones.moNotificacion") console.log("Pasamos con SI.MCA.CCCognitivoNotificaciones.moNotificacion");
                            let arrayNextComponents = await getAllComponents(NORMAL_ME + nextComponent); // Final SN was loaded before with loadMethods, 
                            //if (nextComponent == "SI.MCA.CCCognitivoNotificaciones.moNotificacion") console.log("arrayNextComponents.length:" + arrayNextComponents.length);
                            if (arrayNextComponents.length == 0) { //in this case SN.method doesn't have relation, sometimes is not true. 
                                notRelation2++;
                                let initChars = nextComponent.substring(0, 2);
                                //if (initChars != SI && initChars != 'CA' && initChars != 'SN') console.log(nextComponent);                                
                                if (initChars != SI) { //We only want SN , SRV or BE and their relations.                                                                          
                                    //if (nextComponent == "SI.MCA.CCCognitivoNotificaciones.moNotificacion") console.log("Pasamos1:" + nextComponentWithoutMethod);
                                    changeNextComponentsIfSN(nextComponent);
                                }
                                //else {
                                //  changeNextComponentsIfSI(nextComponent);
                                //}
                            }
                        }
                    }
                }

                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed2 = rowCount;
                resolve(true);
            });
    });
}

/* ******************************
 * UTIL FUNCTIONS , they ar into promises
 ********************************/
//changeNextComponentsIfSN function, 
const changeNextComponentsIfSN = async function (component) {
    //console.log("##6.0-changeNextComponents "  + component + " en " + componentToChange); 
    //if (component == "SN.MCA.CCCognitivoNotif") console.log("Pasamos2 cambio por:" + componentToChange);
    let array = component.split(".");
    if (array.length > 3) {  //we have a mehtod :  4 "." -> SN.MCA.ConsultaClientes.consultaCriterios 
        array.pop();
        let componentWithoutMethod = array.join(".");
        let arrayComponent = await getAllComponents(NORMAL + componentWithoutMethod); // it was load before with loadMethods                                    
        let iterator = arrayComponent.values();
        for (let nextComponent of iterator) { //iterate components with relationship  
            //if (component == "SN.MCA.CCCognitivoNotif") console.log("Pasamos3 cambio :" + nextComponent);       
            //console.log( component + " / " + nextComponent);
            client.sadd(NORMAL_ME + component, nextComponent);
            client.sadd(REVERSE_ME + nextComponent, component);
            //console.log("##6.1-changeNextComponents "  + component + " : " + componentToChange + " -> " + nextComponent);    
        }
    }
}

//changeNextComponentsIfSI function, 
const changeNextComponentsIfSI = async function (component) {
    //console.log("##6.0-changeNextComponents "  + component + " en " + componentToChange); 
    //if (component == "SN.MCA.CCCognitivoNotif") console.log("Pasamos2 cambio por:" + componentToChange);
    let array = component.split(".");
    if (array.length > 3) {  //we have a mehtod :  4 "." -> SN.MCA.ConsultaClientes.consultaCriterios 
        array.pop();
        let componentWithoutMethod = array.join(".");
        let arrayComponent = await getAllComponents(NORMAL + componentWithoutMethod); // it was load before with loadMethods                                    
        let iterator = arrayComponent.values();
        for (let nextComponent of iterator) { //iterate components with relationship  
            //if (component == "SN.MCA.CCCognitivoNotif") console.log("Pasamos3 cambio :" + nextComponent);       
            if (nextComponent.substring(0, 2) != SI) {
                //console.log( component + " / " + nextComponent);
                //client.sadd(NORMAL_ME + component, nextComponent);
                //client.sadd(REVERSE_ME + nextComponent, component);
            }
            //console.log("##6.1-changeNextComponents "  + component + " : " + componentToChange + " -> " + nextComponent);    
        }
    }
}

/* ******************************
 * UTIL FUNCTIONS
 ********************************/
function lowFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


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


//getCost function, this method gets cost of Redis and prepare component value. 
const getCost = async (name) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        client.get(name, (error, result) => { //get the value of hash                   
            if (error) reject(error);  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
            else resolve(result); // everything is OK, return result , even if si null.                                
        });
    });
    //.then((result) => { return result; })  //return the result value of property hash contract
    //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method save id's in a SET for checking retries or errors.
const addSet = async (name, value) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        client.sadd(name, value, (error, result) => { //save the value in set                  
            if (error) reject(error);  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
            else resolve(result); // everything is OK, return result                                  
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

/* ******************************
 * INIT CALL
 ********************************/
//init();
module.exports = { init }