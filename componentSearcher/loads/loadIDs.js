
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
const NORMAL_ME = 'nm_';
const REVERSE_ME = 'rm_';
const NORMAL = 'n_';
const REVERSE = 'r_';
const NORMAL_COMPMEHOD = "ncom_";

//APP CONST
const STRING = 'string';
const UNDEFINED = 'undefined'

//vars
var arrayOfComponentsMEByID = [];
var arrayOfComponentsOPByID = [];

var rowsProcessed = 0;
var rowsProcessed1 = 0;
var areProcessed1 = 0;
var notFound1 = 0;
var rowsProcessed2 = 0;
var areProcessed2 = 0;
var notFound2 = 0;


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


    console.log('\x1b[36m', 'Initializing IDS Relation files load....');

    let loadIDSOK = await Promise.all(
        [
            loadCSV_IDS_RE_ME(toLoad.RE_ME),
            loadCSV_IDS_RE_OP(toLoad.RE_OP)
        ])  //First load ID'S RELATIONS
        .then((values) => {
            console.log('\x1b[33m', '------------IDSLoader:First: All IDS Relation files are loaded correctly on Redis, Rows Processed:' + rowsProcessed + '...Continue next Step------------');
            return true;
        }).catch(error => {
            console.log(`Error in executing ${error}`);
            return false;
        });

    if (loadIDSOK) {
        await Promise.all(
            [
                loadCSV_IDS_ME(toLoad.UN_ME),
                loadCSV_IDS_OP(toLoad.UN_OP)
            ])  //First load ID'S RELATIONS
            .then((values) => {
                console.log(" SI/SN Load : Rows Processed: " + rowsProcessed1 + ", Components Processed:" + areProcessed1 + ", ID not found:" + notFound1);
                console.log(" CA/OP Load : Rows Processed: " + rowsProcessed2 + ", Components Processed:" + areProcessed2 + ", ID not found:" + notFound2);
                let rowsProcessedTotal = rowsProcessed1 + rowsProcessed2;
                let areProcessedTotal = areProcessed1 + areProcessed2;
                console.log('\x1b[32m', '------------Finish IDSLoader: All files are loaded correctly on Redis, ' + rowsProcessedTotal + ' rows have been processed. And save ' + areProcessedTotal + ' Components .------------');
                return true;
            }).catch(error => {
                console.log(`Error in executing ${error}`);
                return false;
            });
    }

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
            .on('data', row => {

                let idStr = row[params.Col1];

                if (!isNaN(idStr)) {  //bad row we discard it
                    let componentWithoutMethod = row[params.Col2] + '.' + row[params.Col3] + '.' + row[params.Col4];
                    let component = lowFirstLetter(row[params.Col5]);

                    if (component.trim() != '') component = componentWithoutMethod + '.' + component; //Sometimes method doesn't exist
                    else component = componentWithoutMethod //Sometimes method doesn't exist          

                    let id = parseInt(idStr);
                    if (arrayOfComponentsMEByID[id] == null) arrayOfComponentsMEByID[id] = new Set();

                    arrayOfComponentsMEByID[id].add(component); //save relation ID in Set

                    if (componentWithoutMethod != component)
                        client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component. 

                    //console.log("#0-ME_INI-Save : " + component + ":" + id);

                }
                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed = rowsProcessed + rowCount;
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
            .on('data', row => {

                let idStr = row[params.Col1];
                if (!isNaN(idStr)) {  //bad row we discard it
                    let componentWithoutMethod = row[params.Col2] + '.' + row[params.Col3] + '.' + row[params.Col4];
                    let component = lowFirstLetter(row[params.Col5]);

                    if (component.trim() != '') component = componentWithoutMethod + '.' + component; //Sometimes method doesn't exist
                    else component = componentWithoutMethod //Sometimes method doesn't exist

                    let id = parseInt(idStr);
                    if (arrayOfComponentsOPByID[id] == null) arrayOfComponentsOPByID[id] = new Set(); //save relation ID

                    arrayOfComponentsOPByID[id].add(component); //save relation ID in Set
                    if (componentWithoutMethod != component)
                        client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component. 

                    //console.log("#0-OP_INI-Save : " + component + ":" + id);
                }
                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed = rowsProcessed + rowCount;
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

                    //console.log("#0-ME:Registro:" + component); 

                    //SAVE Component Without Method, only for consulting          
                    if (componentWithoutMethod != component)
                        client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component. 

                    let id = parseInt(idStr);
                    //SAVE Component in array
                    if (arrayOfComponentsMEByID[id]) {
                        for (let nextComponent of arrayOfComponentsMEByID[id]) { //iterate components with relationship              
                            //console.log("#1-ME:ID-Encontrado:" + component + " -> " + nextComponent + " : " + id);  // SI -> SN/SI

                            areProcessed1++;
                            client.sadd(NORMAL_ME + component, nextComponent);
                            client.sadd(REVERSE_ME + nextComponent, component);

                            let array = nextComponent.split('.');
                            if (array.length == 4) { // With method
                                array.pop();
                                let nextComponentWithOutMethod = array.join('.');
                                client.sadd(NORMAL + componentWithoutMethod, nextComponentWithOutMethod);
                                client.sadd(REVERSE + nextComponentWithOutMethod, componentWithoutMethod);
                            } else { // Without method
                                client.sadd(NORMAL + componentWithoutMethod, nextComponent);
                                client.sadd(REVERSE + nextComponent, componentWithoutMethod);
                            }

                        }
                    } else { //We don't find ID in Interface
                        //console.log("#3-ME:ID NO encontrado:" + component + ":" + id);                         

                        notFound1++;
                        //await changeNextComponents(componentWithoutMethod, component);



                    }

                }
                //console.log(`ROW=${JSON.stringify(row)}`);
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                rowsProcessed1 = rowCount;
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

                    //console.log("#0-OP:Registro:" + component); 

                    //SAVE Component Without Method, only for consulting          
                    if (componentWithoutMethod != component)
                        client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component.             

                    let id = parseInt(idStr);
                    if (arrayOfComponentsOPByID[id]) {
                        for (let nextComponent of arrayOfComponentsOPByID[id]) { //iterate components with relationship              
                            //console.log("#1-OP:ID-Encontrado:" + component + " -> " + nextComponent + " : " + id);  // SI -> SN/SI

                            areProcessed2++;
                            client.sadd(NORMAL_ME + component, nextComponent);
                            client.sadd(REVERSE_ME + nextComponent, component);

                            let array = nextComponent.split('.');
                            if (array.length == 4) { // With method
                                array.pop();
                                let nextComponentWithOutMethod = array.join('.');
                                client.sadd(NORMAL + componentWithoutMethod, nextComponentWithOutMethod);
                                client.sadd(REVERSE + nextComponentWithOutMethod, componentWithoutMethod);
                            } else { // Without method
                                client.sadd(NORMAL + componentWithoutMethod, nextComponent);
                                client.sadd(REVERSE + nextComponent, componentWithoutMethod);
                            }
                        }
                    } else {
                        //console.log("#3-OP:ID NO encontrado:" + component + ":" + id); 
                        notFound2++;
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
 * UTIL FUNCTIONS
 ********************************/
function lowFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


const changeNextComponents = async function (component, componentToChange) {

    //console.log("##6.0-changeNextComponents "  + component + " en " + componentToChange); 

    let arrayComponent = await getAllComponents(NORMAL_ME + component); // it was load before with loadMethods                                    
    let iterator = arrayComponent.values();
    for (let nextComponent of iterator) { //iterate components with relationship                     
        client.sadd(NORMAL_ME + componentToChange, nextComponent);
        client.sadd(REVERSE_ME + nextComponent, componentToChange);

        //console.log("##6.1-changeNextComponents "  + component + " : " + componentToChange + " -> " + nextComponent);    
    }
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