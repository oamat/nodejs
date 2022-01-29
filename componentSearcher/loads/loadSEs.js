
"use strict";

/* METHOD RELATIONSHIP LOADER
 * This program load CSV files into Redis with all relationship between methods, it is based on several CSV or any repository.  *        
 *  * It is 100% async and we use promises. 
 *  * The program load each relation with Sets (SE <-> SI, SI <-> SN, SN <-> BE, BE <-> DB,... 
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
    SE_SI: { doc: 'UnificacionInterface_SE.csv', Col1: 0, Col2: 1, Col3: 17, Col4: 18 }, //it doesn't have methods, We don't need to load with prefix nm_
    SE_TX: { doc: 'UnificacionInterface_SE_TX.csv', Col1: 0, Col2: 1, Col3: 2, Col4: 3 }, //it doesn't have methods, We don't need to load with prefix nm_     
    SE_SI_Method: { doc: 'SE_x_SI_Metodos.csv', Col1: 1, Col2: 3, Col3: 4}, //it have methods, We have to load with prefix nm_ 
    SE_MON_Method1: { doc: 'CN.CA.csv', Col1: 0 }, //it have methods, We have to load with prefix nm_ 
    SE_MON_Method2: { doc: 'CO.CA.csv', Col1: 0 }, //it have methods, We have to load with prefix nm_ 
    SE_MON_Method3: { doc: 'CX.CA.csv', Col1: 0 }, //it have methods, We have to load with prefix nm_ 
    SE_MON_Method4: { doc: 'LO.CA.csv', Col1: 0 }, //it have methods, We have to load with prefix nm_ 
};

//LOAD CONST
const PATH = './csv/interfaces/';
const PATH_MON = './csv/monitoring/';
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
            loadCSV_SE(toLoad.SE_SI),
            loadCSV_SExTX(toLoad.SE_TX),
            loadCSV_SExSI_Method(toLoad.SE_SI_Method)
        ]).then(() => {
            console.log('\x1b[33m', '------------SEs Loader: First: All DevPortal files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save. Continue next step------------');
        }).catch(error => console.log(`Error in executing ${error}`));



    await Promise.all(
        [
            loadCSV_SExSI_Method_From_Mon(toLoad.SE_MON_Method1),
            loadCSV_SExSI_Method_From_Mon(toLoad.SE_MON_Method2),
            loadCSV_SExSI_Method_From_Mon(toLoad.SE_MON_Method3),
            loadCSV_SExSI_Method_From_Mon(toLoad.SE_MON_Method4),
        ]).then(() => {
            console.log('\x1b[33m', '------------SEs Loader: First: All MON files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save. Continue next step------------');
        }).catch(error => console.log(`Error in executing ${error}`));





    console.log('\x1b[32m', '------------Finish SEs Loader: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed and save.------------');
    //client.quit();
    //process.exit(1);

}






/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/


//loadCSV_SE function, SE CSV Loader.
const loadCSV_SE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = row[params.Col1] + '.' + row[params.Col2];
                let component2 = row[params.Col3] + '.' + row[params.Col4];
                client.sadd(NORMAL + component1, component2);
                client.sadd(REVERSE + component2, component1);

                //console.log(component1 + " : " + component2)
                //console.log(`ROW=${JSON.stringify(row)}`)

            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}

//loadCSV_SExTX function, SE X TX Loader.
const loadCSV_SExSI_Method = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1WithoutMethod = row[params.Col1];
                let component2WithoutMethod = row[params.Col2];                
                let method = row[params.Col3];
                let component1 = component1WithoutMethod + '.' + method;
                let component2 = component2WithoutMethod + '.' + method;

                client.sadd(NORMAL_ME + component1, component2);
                client.sadd(REVERSE_ME + component2, component1);

                if (component1WithoutMethod != component1)
                    client.sadd(NORMAL_COMPMEHOD + component1WithoutMethod, component1); //We Save all the methods of component SE. 

                if (component2WithoutMethod != component2)
                    client.sadd(NORMAL_COMPMEHOD + component2WithoutMethod, component2); //We Save all the methods of component SI. 
                //console.log(component1 + " : " + component2)
                //console.log(`ROW=${JSON.stringify(row)}`)

            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}


//loadCSV_SExTX function, SE X TX Loader.
const loadCSV_SExTX = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component1 = row[params.Col1];
                let index = component1.indexOf(".", 8);
                if (index > 0) component1 = component1.substring(0, index);
                let component2 = row[params.Col2];  // "=>SI.MCA.AlfabeticPersonaMultiCanal.9.3.1=>SN.MCA.AlfabeticPersonaMoSenyLOPD.2.1.2"
                component2 = component2.substring(2, component2.length); //delete => initial
                let component3 = 'ADS.' + row[params.Col3];
                saveForSearch(component3, 5);
                let component4 = 'TX.' + row[params.Col4]; //it can be empty
                saveForSearch(component4);
                let indexOf2Components = component2.indexOf("=>");
                if (indexOf2Components > 0) {
                    let component2_2 = component2.substring(indexOf2Components + 2, component2.length);
                    component2 = component2.substring(0, indexOf2Components);
                    let index2 = component2.indexOf(".", 8);
                    if (index2 > 0) component2 = component2.substring(0, index2);
                    let index3 = component2_2.indexOf(".", 8);
                    if (index3 > 0) component2_2 = component2_2.substring(0, index3);

                    client.sadd(NORMAL + component1, component2);
                    client.sadd(REVERSE + component2, component1);
                    client.sadd(NORMAL + component2, component2_2);
                    client.sadd(REVERSE + component2_2, component2);
                    client.sadd(NORMAL + component2_2, component3);
                    client.sadd(REVERSE + component3, component2_2);
                    client.sadd(NORMAL + component3, component4);
                    client.sadd(REVERSE + component4, component3);

                } else {
                    let index3 = component2.indexOf(".", 8);
                    if (index3 > 0) component2 = component2.substring(0, index3);
                    client.sadd(NORMAL + component1, component2);
                    client.sadd(REVERSE + component2, component1);
                    client.sadd(NORMAL + component2, component3);
                    client.sadd(REVERSE + component3, component2);
                    client.sadd(NORMAL + component3, component4);
                    client.sadd(REVERSE + component4, component3);


                }

                //console.log(component1 + " : " + component2 + " : " + component3 + " : " + component4 );
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}



//loadCSV_SExTX function, SE X TX Loader.
const loadCSV_SExSI_Method_From_Mon = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH_MON + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async row => {
                let component = row[params.Col1];
                if (typeof component !== 'undefined' && typeof component === 'string' && component.trim() != '') {
                    if (component.substring(0, 3) == 'SE.') {
                        let array = component.split('.');
                        let method = array[3];
                        let componentWithoutMethod = array[0] + '.' + array[1] + '.' + array[2];
                        let arrayNextComponents = await getAllComponents(NORMAL + componentWithoutMethod); //SE Without Method
                        if (arrayNextComponents.length != 0) { //Exist a SI
                            let iterator = arrayNextComponents.values();
                            for (let nextComponent of iterator) { //iterate components SI with relationship
                                let component1 = componentWithoutMethod + '.' + method; //SE with method
                                let component2 = nextComponent + '.' + method;  //SI with method
                                let arrayNextComponents2 = await getAllComponents(NORMAL_ME + component2);  // get SI with method
                                let arrayNextComponents3 = await getAllComponents(REVERSE_ME + component2);  // get SI with method
                                if (arrayNextComponents2.length != 0 || arrayNextComponents3.length != 0) {  // if SI with method exist and have relation NORMAL or REVERSE we can save relation with SE.

                                    client.sadd(NORMAL_ME + component1, component2);
                                    client.sadd(REVERSE_ME + component2, component1);
                                    client.sadd(NORMAL + componentWithoutMethod, nextComponent);
                                    client.sadd(REVERSE + nextComponent, componentWithoutMethod);

                                    if (componentWithoutMethod != component1)
                                        client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component1); //We Save all the methods of component SE. 

                                    if (nextComponent != component2)
                                        client.sadd(NORMAL_COMPMEHOD + nextComponent, component2); //We Save all the methods of component SE. 


                                    //console.log(component1 + " : " + component2 + " : " + component);
                                    //console.log(componentWithoutMethod + " : " + nextComponent );
                                }
                            }
                        }
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
function lowFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

const saveBEIfIsPRQ = async function (component) {
    //BE Pure query -> PRQ
    if (component.lastIndexOf("PRQ") == 6) {
        client.sadd(NORMAL + component, "DB.DBE1");
        client.sadd(REVERSE + "DB.DBE1", component);
    }
}

//saveForSearch function, search components in Redis. 
const saveForSearch = async function (component, ini = 4) {
    let max = component.length;
    for (let i = ini; i <= max; i++) {
        //console.log(db.substring(0, i) + " : " + i);
        client.sadd(NORMAL_COMPMEHOD + component.substring(0, i), component); //We Save all the methods of component. 
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