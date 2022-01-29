
"use strict";

/* Components RELATIONSHIP LOADER
 * This program load CSV files into Redis with all cost components, it is based on several CSV or any repository.  *        
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
    CO_CA: { doc: 'CO.CA.csv', Col1: 0, Col2: 5, Col3: 7 },
    CO_SI: { doc: 'CO.SI.csv', Col1: 0, Col2: 5, Col3: 7 },
    CO_SN: { doc: 'CO.SN.csv', Col1: 0, Col2: 5, Col3: 7 },
    CO_SN_BE: { doc: 'CO.SN_BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CO_BE: { doc: 'CO.BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CO_SN_IMS: { doc: 'CO.SN_IMS.csv', Col1: 0, Col2: 5, Col3: 7 },

    LO_CA: { doc: 'LO.CA.csv', Col1: 0, Col2: 5, Col3: 7 },
    LO_SI: { doc: 'LO.SI.csv', Col1: 0, Col2: 5, Col3: 7 },
    LO_SN: { doc: 'LO.SN.csv', Col1: 0, Col2: 5, Col3: 7 },
    LO_SN_BE: { doc: 'LO.SN_BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    LO_BE: { doc: 'LO.BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    LO_SN_IMS: { doc: 'LO.SN_IMS.csv', Col1: 0, Col2: 5, Col3: 7 },

    CX_CA: { doc: 'CX.CA.csv', Col1: 0, Col2: 5, Col3: 7 },
    CX_SI: { doc: 'CX.SI.csv', Col1: 0, Col2: 5, Col3: 7 },
    CX_SN: { doc: 'CX.SN.csv', Col1: 0, Col2: 5, Col3: 7 },
    CX_SN_BE: { doc: 'CX.SN_BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CX_BE: { doc: 'CX.BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CX_SN_IMS: { doc: 'CX.SN_IMS.csv', Col1: 0, Col2: 5, Col3: 7 },

    CN_CA: { doc: 'CN.CA.csv', Col1: 0, Col2: 5, Col3: 7 },
    CN_SI: { doc: 'CN.SI.csv', Col1: 0, Col2: 5, Col3: 7 },
    CN_SN: { doc: 'CN.SN.csv', Col1: 0, Col2: 5, Col3: 7 },
    CN_SN_BE: { doc: 'CN.SN_BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CN_BE: { doc: 'CN.BE.csv', Col1: 0, Col2: 5, Col3: 7 },
    CN_SN_IMS: { doc: 'CN.SN_IMS.csv', Col1: 0, Col2: 5, Col3: 7 },

};

//REDIS PREFIX CONST
const PATH = './csv/monitoring/';
const MONCOST = 'a_';

const NORMAL_COMPMEHOD = "ncom_"; // Only Methods: find all METHODS that a specific component contains

//APP CONST
const STRING = 'string';
const UNDEFINED = 'undefined'

//APP VAR
var notProcessed = 0;
var areProcessed = 0;
var arrayOfCosts = [];
var allComponentsSet = new Set();

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
            loadCSV_MON_CA(toLoad.CO_CA),
            loadCSV_MON(toLoad.CO_SI),
            loadCSV_MON(toLoad.CO_SN),
            loadCSV_MON(toLoad.CO_SN_BE),
            loadCSV_MON_BE(toLoad.CO_BE),
            loadCSV_MON(toLoad.CO_SN_IMS),

            loadCSV_MON_CA(toLoad.LO_CA),
            loadCSV_MON(toLoad.LO_SI),
            loadCSV_MON(toLoad.LO_SN),
            loadCSV_MON(toLoad.LO_SN_BE),
            loadCSV_MON_BE(toLoad.LO_BE),
            loadCSV_MON(toLoad.LO_SN_IMS),

            loadCSV_MON_CA(toLoad.CN_CA),
            loadCSV_MON(toLoad.CN_SI),
            loadCSV_MON(toLoad.CN_SN),
            loadCSV_MON(toLoad.CN_SN_BE),
            loadCSV_MON_BE(toLoad.CN_BE),
            loadCSV_MON(toLoad.CN_SN_IMS),

            loadCSV_MON_CA(toLoad.CX_CA),
            loadCSV_MON(toLoad.CX_SI),
            loadCSV_MON(toLoad.CX_SN),
            loadCSV_MON(toLoad.CX_SN_BE),
            loadCSV_MON_BE(toLoad.CX_BE),
            loadCSV_MON(toLoad.CX_SN_IMS)

        ]).then(() => {
            //We Save to Redis if cost is higher than previous.     
            for (let component of allComponentsSet) { //iterate attributes        
                saveNewCost(component, arrayOfCosts[component].tavg, arrayOfCosts[component].cost);
            }
            //allComponentsSet.size*3  because we saved cost of component(+1), componentWithoutMethod(+1), and search methods(+1) per component = 3
            console.log('\x1b[32m', '------------Finish MonitoringLoader: All files are loaded correctly on Redis, ' + areProcessed + ' rows have been processed (' + allComponentsSet.size * 3 + ' saved). And  ' + notProcessed + ' rows have not processed.------------');
        }).catch(error => console.log(`Error in executing ${error}`));



    //client.quit();
    //process.exit(1);
}


/* ******************************
 * FILE LOAD FUNCTIONS
 ********************************/

//loadCSV_MON function, Generic Cost Loader.
const loadCSV_MON = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async (row) => {
                try {
                    //console.log ("#" + row[0] + "#" + row[1] + "#" +  row[2] + "#"+ row[3] + "#" + row[4] + "#" +  row[5] + "#"+ row[6] + "#" +  row[7] + "#")

                    let component = row[params.Col1];
                    let requestsRaw = row[params.Col2];
                    let tavgRaw = row[params.Col3];
                    if (!isNaN(requestsRaw) && !isNaN(tavgRaw) && typeof component !== UNDEFINED && typeof component === STRING && component.trim() != '') {
                        let requests = parseInt(requestsRaw);
                        let tavg = parseInt(tavgRaw);
                        let cost = requests * tavg;
                        //console.log(cost);


                        let array = component.split('.');
                        if (array[1] == 'CA' || array[1] == 'SE' || array[1] == 'SI' || array[1] == 'SN') {
                            let finalPart = array.shift();
                            component = array.join('.') + '.' + finalPart;
                            //console.log(component);
                        }


                        // Cost of Component with Method  //We Save only if cost is higher than previous. 
                        if (arrayOfCosts[component] != null) {
                            let totalRequests1 = arrayOfCosts[component].requests + requests;
                            let totalCost1 = arrayOfCosts[component].cost + cost;
                            arrayOfCosts[component].requests = totalRequests1;
                            arrayOfCosts[component].cost = totalCost1;
                            arrayOfCosts[component].tavg = Math.round(totalCost1 / totalRequests1);
                            allComponentsSet.add(component);                            
                        } else {
                            arrayOfCosts[component] = { cost, tavg, requests };
                            allComponentsSet.add(component);
                        }

                        // Cost of Component WithoutMethod //We Save only if cost is higher than previous. 
                        if (array.length > 3) {  // Only if it is a Component with method
                            array.pop();
                            let componentWithoutMethod = array.join('.');  //we delete last part after '.' 
                            if (arrayOfCosts[componentWithoutMethod] != null) {
                                let totalRequests2 = arrayOfCosts[componentWithoutMethod].requests + requests;
                                let totalCost2 = arrayOfCosts[componentWithoutMethod].cost + cost;
                                arrayOfCosts[componentWithoutMethod].requests = totalRequests2;
                                arrayOfCosts[componentWithoutMethod].cost = totalCost2;
                                arrayOfCosts[componentWithoutMethod].tavg = Math.round(totalCost2 / totalRequests2);
                                allComponentsSet.add(componentWithoutMethod);                                
                            } else {
                                arrayOfCosts[componentWithoutMethod] = { cost, tavg, requests };
                                allComponentsSet.add(componentWithoutMethod);
                            }

                            if (componentWithoutMethod != component)
                                client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component.

                        }
                    } else {
                        //console.log ("#" + component + "#" + requestsRaw + "#" +  tavgRaw + "#");
                        notProcessed++;
                    }
                } catch (error) { console.error(error); }

            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}


//loadCSV_MON function, Generic Cost Loader.
const loadCSV_MON_CA = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async (row) => {
                try {
                    //console.log ("#" + row[0] + "#" + row[1] + "#" +  row[2] + "#"+ row[3] + "#" + row[4] + "#" +  row[5] + "#"+ row[6] + "#" +  row[7] + "#")

                    let component = row[params.Col1];
                    let requestsRaw = row[params.Col2];
                    let tavgRaw = row[params.Col3];
                    if (!isNaN(requestsRaw) && !isNaN(tavgRaw) && typeof component !== UNDEFINED && typeof component === STRING && component.trim() != '') {
                        let requests = parseInt(requestsRaw);
                        let tavg = parseInt(tavgRaw);
                        let cost = requests * tavg;
                        //console.log(cost);

                        let array = component.split('.');
                        if (array[1] == 'CA' || array[1] == 'SE' || array[1] == 'SI' || array[1] == 'SN') {
                            let finalPart = array.shift();
                            component = array.join('.') + '.' + finalPart;
                        }

                        if (array.length == 5) { //SE or SI_CN CASE with interfaces, we have to delete last part.
                            array.pop(); //drop last part, the Interface. 
                            component = array.join('.');  //we join all parts.
                            //console.log (component);
                        }

                        // Cost of Component with Method  //We Save only if cost is higher than previous. 
                        if (arrayOfCosts[component] != null) {
                            let totalRequests1 = arrayOfCosts[component].requests + requests;
                            let totalCost1 = arrayOfCosts[component].cost + cost;
                            arrayOfCosts[component].requests = totalRequests1;
                            arrayOfCosts[component].cost = totalCost1;
                            arrayOfCosts[component].tavg = Math.round(totalCost1 / totalRequests1);
                            allComponentsSet.add(component);                            
                        } else {
                            arrayOfCosts[component] = { cost, tavg, requests };
                            allComponentsSet.add(component);
                        }


                        // Cost of Component WithoutMethod //We Save only if cost is higher than previous. 
                        if (array.length > 3) {  // Only if it is a Component with method
                            array.pop();
                            let componentWithoutMethod = array.join('.');  //we delete last part after '.' 
                            if (arrayOfCosts[componentWithoutMethod] != null) {
                                let totalRequests2 = arrayOfCosts[componentWithoutMethod].requests + requests;
                                let totalCost2 = arrayOfCosts[componentWithoutMethod].cost + cost;
                                arrayOfCosts[componentWithoutMethod].requests = totalRequests2;
                                arrayOfCosts[componentWithoutMethod].cost = totalCost2;
                                arrayOfCosts[componentWithoutMethod].tavg = Math.round(totalCost2 / totalRequests2);
                                allComponentsSet.add(componentWithoutMethod);                                
                            } else {
                                arrayOfCosts[componentWithoutMethod] = { cost, tavg, requests };
                                allComponentsSet.add(componentWithoutMethod);
                            }

                            if (componentWithoutMethod != component)
                                client.sadd(NORMAL_COMPMEHOD + componentWithoutMethod, component); //We Save all the methods of component.
                        }

                    } else {
                        //console.log ("#" + component + "#" + requestsRaw + "#" +  tavgRaw + "#");
                        notProcessed++;
                    }

                } catch (error) { console.error(error); }

            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                areProcessed = areProcessed + rowCount;
                resolve(true);
            });
    });
}


//loadCSV_AFE_BE function, BE Cost Loader.
const loadCSV_MON_BE = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(PATH + params.doc)
            .pipe(csv.parse({ delimiter: ',' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', async (row) => {
                try {
                    let component = row[params.Col1];
                    let requestsRaw = row[params.Col2];
                    let tavgRaw = row[params.Col3];
                    if (!isNaN(requestsRaw) && !isNaN(tavgRaw) && typeof component !== UNDEFINED && typeof component === STRING && component.trim() != '') {
                        let array = component.split('_');
                        component = 'BE.' + array[0];
                        let requests = parseInt(requestsRaw);
                        let tavg = parseInt(tavgRaw);
                        let cost = requests * tavg;
                        //console.log(cost);

                        // Cost of Component with Method  //We Save only if cost is higher than previous. 
                        if (arrayOfCosts[component] != null) {
                            let totalRequests1 = arrayOfCosts[component].requests + requests;
                            let totalCost1 = arrayOfCosts[component].cost + cost;
                            arrayOfCosts[component].requests = totalRequests1;
                            arrayOfCosts[component].cost = totalCost1;
                            arrayOfCosts[component].tavg = Math.round(totalCost1 / totalRequests1);
                            allComponentsSet.add(component);
                        } else {
                            arrayOfCosts[component] = { cost, tavg, requests };
                            allComponentsSet.add(component);
                        }

                        //BE-Methods of component BE
                        let componentWithMethod = component + '.' + array[1].replace('(..)', '');
                        if (arrayOfCosts[componentWithMethod] != null) {
                            let totalRequests2 = arrayOfCosts[componentWithMethod].requests + requests;
                            let totalCost2 = arrayOfCosts[componentWithMethod].cost + cost;
                            arrayOfCosts[componentWithMethod].requests = totalRequests2;
                            arrayOfCosts[componentWithMethod].cost = totalCost2;
                            arrayOfCosts[componentWithMethod].tavg = Math.round(totalCost2 / totalRequests2);
                            allComponentsSet.add(componentWithMethod)
                            client.sadd(NORMAL_COMPMEHOD + component, componentWithMethod); //We Save all the methods of component.
                        } else {
                            arrayOfCosts[componentWithMethod] = { cost, tavg, requests };
                            allComponentsSet.add(componentWithMethod);
                            client.sadd(NORMAL_COMPMEHOD + component, componentWithMethod); //We Save all the methods of component.
                        }

                    } else {
                        //console.log ("#" + component + "#" + requestsRaw + "#" +  tavgRaw + "#");
                        notProcessed++;
                    }
                } catch (error) { console.error(error); }
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
//getCostWithNotation function, prepares the number scale for preview, in IT notation.
const getCostWithNotation = async function (cost) {
    let costStr = cost.toString();
    let costLen = costStr.length;
    let Remainder = costLen % 3;
    if (Remainder == 0) Remainder = 3;

    //we cut the interesting part
    let costToPrint = costStr.slice(0, Remainder);

    //we add the point and the next number
    costStr = costStr.substring(Remainder, Remainder + 1);
    if (costStr == "0") costStr = "1";
    if (costLen > 3) costToPrint = costToPrint + '.' + costStr;

    // We add the Notation
    if (costLen < 4) costToPrint = costToPrint + 'b';
    else if (costLen < 7) costToPrint = costToPrint + 'K';
    else if (costLen < 10) costToPrint = costToPrint + 'M';
    else if (costLen < 13) costToPrint = costToPrint + 'G';
    else if (costLen < 16) costToPrint = costToPrint + 'T';
    else if (costLen < 19) costToPrint = costToPrint + 'P';
    else if (costLen < 21) costToPrint = costToPrint + 'E';
    else costToPrint = costToPrint + '**';

    return costToPrint;
}


/* ******************************
 * REDIS FUNCTIONS , they ar into promises
 ********************************/


const saveNewCost = async function (component, tavg, cost) {
    let costStr = await getCostWithNotation(cost);
    //console.log(getCostWithNotation(cost));
    costStr = '(' + tavg + 'ms' + '/' + costStr + ')';
    //console.log(MONCOST + component + " -> " + costStr);
    client.set(MONCOST + component, costStr); //await Preventing override the next save
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
}

/* ******************************
 * INIT CALL
 ********************************/
//init();
module.exports = { init }
