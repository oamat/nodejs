"use strict";

/*
 * This program search arelationship between components, it is based on several CSV or any repository and a batch with load components into Redis is needed (load.js).  *        
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
const redis = require("redis");
const prompts = require('prompts');
const fs = require('fs');
const { exit } = require('process');
const { writeToPath } = require('@fast-csv/format');
const path = require('path');


//CONST
const NORMAL = 'n_'; //default way normal
const REVERSE = 'r_'; //default way reverse
const NORMAL_ME = 'nm_'; // Components with methods Normal
const REVERSE_ME = 'rm_'; // Components with methods Reverse
const NORMAL_CA = 'nc_'; // Only save CA's -> CA's Normal
const REVERSE_CA = 'rc_'; // Only save CA's -> CA's Reverse
const NORMAL_BC = 'cn_'; // Only save BE's -> BC's Normal
const REVERSE_BC = 'cr_'; // Only save BE's -> BC's Reverse
const NORMAL_CLUSTER = 'ncl_'; //Only save DB - Clusters Normal
const REVERSE_CLUSTER = 'rcl_';//Only save DB - Clusters Reverse
const NORMAL_SA = 'nsa_'; //Only save ADS - SA Normal
const REVERSE_SA = 'rsa_'; //Only save ADS - SA Reverse
const AFECT = 'a_'; //Cost/affection
const NORMAL_COMPMEHOD = "ncom_"; // Only Methods: find all METHODS that a specific component contains

//CONST LITERALS
const LASTUPDATE = '01/11/2021'; //Cost/affection
const INFO_UPDATE = '                               LAST UPDATE INFO: ' + LASTUPDATE;
const BE = 'BE';
const CA = 'CA';
const SI = 'SI';
const SE = 'SE';
const SN = 'SN';
const DB = 'DB';
const BC = 'BC';
const AD = 'AD';
const XM = 'XM';
const PN = 'PN';
const TX = 'TX';
const SA = 'SA';
const CL = 'CL';
const SY = 'SY';
const ALL = 'ALL';
const METHODS = 'METHODS';
const NOHITS = '(noHits/0)';
const LOOP_IN = '<-**LOOP_IN:';

//vars & ARGUMENTS
const response = {};

// CLI PROMPT RESPONSE VARS
var client; //Redis client

var levelSearch;
var headersForCSV = { '0': '0', '1': '1', '2': '2' }; //the filter case. 
var order;
var skipSI;
var withMethod;
var componentToSearch;
var componentTypeToSearch;
var withCostOfComponent;

// PREPARED VARS FROM CLI PROMPT RESPONSE VARS
var charsInit;
var prefixSearch;

// Multidimensional Array Result to print by Screen or file. 
var arrayOfArrays = [];


/* ******************************
 * REDIS CONFIG & INITIALITATION
 ********************************/
const initRedis = async function (RedisIP, RedisPort) {
    //const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
    //const client = redis.createClient({ host: '127.0.0.1', port: '6379' });
    client = redis.createClient({ host: RedisIP, port: RedisPort });
    client.on("error", function (error) {  //little test
        console.error(error);
    });

    //ACCESS TEST REDIS    
    let test = await getCost("TEST");

    if (test == 'test') return 1;
    else {
        console.log('\x1b[31m', 'ERROR : Redis is empty, please load info or copy rdb :  ' + RedisIP + ':' + RedisPort);
        console.error('ERROR : Redis is empty, please load info or copy rdb :   ' + RedisIP + ':' + RedisPort);
        exit(1);
    }
    //END  ACCESS TEST REDIS*/
}



/* ******************************
 * INIT PROGRAM
 ********************************/

//init function, it launchs the prompt and later calls recursive methods. 
const init = async function (config) {

    await initRedis(config.RedisIP, config.RedisPort);
    await getResponsePrompts(); // launch prompt
    console.log(response); //print results
    console.log('\x1b[36m', ' Wait while Searching .........');
    console.log('\x1b[36m', INFO_UPDATE);

    ({ componentToSearch, levelSearch, order, skipSI, componentTypeToSearch, withMethod, withCostOfComponent } = response); //Destructuring without declaration const & var
    //const { componentToSearch, levelSearch,  order, skipSI } = response; //Destructuring with declaration

    if (componentTypeToSearch == ALL)
        for (let i = 0; i <= levelSearch; i++) headersForCSV[i] = i;  //generate all table headers 


    if (componentTypeToSearch != ALL && componentTypeToSearch != METHODS) { //FILTERS //calls recursive methods for type 
        if (componentTypeToSearch == CA && charsInit == CA) prefixSearch = order ? NORMAL_CA : REVERSE_CA; //prefix for CA's searching CA's        
        else if (withMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes        
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes        
        await prepareRecursiveOnlyAType(componentToSearch, -1);
    } else if (componentTypeToSearch == METHODS) { //find all methods that a specific component contains
        prefixSearch = NORMAL_COMPMEHOD;  //change prefixSearch     
        await recursiveMethodGeneral(componentToSearch, {}, -1); //normal way
    } else if (skipSI) { //IF WE WANT SKIP SI'S
        if (withMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes
        await recursiveMethodWithoutSI(componentToSearch, {}, -1);
    } else { //ALL COMPONENTS SEARCH
        if (withMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes        
        await recursiveMethodGeneral(componentToSearch, {}, -1);
    }


    //print results on screen and file
    if (arrayOfArrays.length < 5000) console.table(arrayOfArrays);
    else console.log('\x1b[36m', 'Too Much Results, Only the ./results/outputs/' + componentToSearch + '.csv file will be saved!');

    if (arrayOfArrays.length == 1 && arrayOfArrays[0][1] == null) console.log('\x1b[31m', '        No results found.');

    /*     //CREATE JSON FILE
        let file = fs.createWriteStream('./results/outputs/' + componentToSearch + '.json');
        file.write('{ "results": [\n');
        arrayOfArrays.forEach(function (element) { file.write(JSON.stringify(element) + ',\n'); });
        file.write('{}]}\n');
        file.end();
        file.on('end', function () {
            console.log('\x1b[32m', 'The ./results/outputs/' + componentToSearch + '.json file was saved!');
            process.exit(1);
        });
        file.on('error', function (err) {
            console.log(err)
        }); */

    //CREATE CSV
    //const csvStream = format({ headers: true, delimiter: ';' });
    arrayOfArrays.unshift(headersForCSV); //Prepare Headers For CSV: headers:true not work if first is less than others. 
    writeToPath(path.resolve('./results/outputs/', componentToSearch + '.csv'), arrayOfArrays, { delimiter: ';' })
        .on('error', err => console.error(err))
        .on('finish', () => {
            console.log('\x1b[36m', ' ./results/outputs/' + componentToSearch + '.csv writing. Last Components Update : ' + LASTUPDATE);
            //console.log('\x1b[31m', INFO_UPDATE);
            process.exit(1);
        });



}


/* ******************************
 * UTIL FUNCTIONS
 ********************************/
//existComponentInJson function, returns true if component exist in json, we don't want repetitions. 
const existComponentInJson = async function (component, json) {
    let cancel = false;
    for (var attribute in json) { //we need to test component don't call the a same component as before
        if (json[attribute] == component) { // don't recursive elements
            cancel = true; //if the component is the same we cancel work
            break;
        }
    }
    return cancel;
}

//saveComponentToJson function, returns json adding the new component. 
const saveComponentToJson = async function (component, json, index) {
    json[index] = component; //add component to json    
    return json;
}

//saveComponentToJson function, returns json adding the new component in the optimal position. In this case we don't know index
const saveComponentToJsonInLastPos = async function (component, json) {
    json[Object.keys(json).length] = component; //add component to json in last position. First is 0   
    return json;
}

//pushJson function,  push new json into global array 'arrayOfArrays' with the time and cost added.
const pushJson = async function (json) {
    //console.log(json);    ;
    for (var attribute in json) { //iterate attributes      
        let component = json[attribute];
        let componentCharsInit = component ? component.substring(0, 2) : '#';

        //COST OF COMPONENTS    
        if (withCostOfComponent) {
            if (componentCharsInit == SE || componentCharsInit == CA || componentCharsInit == SI || componentCharsInit == SN || componentCharsInit == BE) {
                let cost = await getCost(AFECT + component);
                if (cost) json[attribute] = component + cost;
                else json[attribute] = component + NOHITS;  //in this case it is different a DB.        

                //ADDITIONAL INFO CLUSTER DB or CL-Cloud of BE        
            }
        }

        //BC of BE and CLUSTER of DB
        if (componentCharsInit == BE) {
            let bc = await getBC(NORMAL_BC + component);
            if (bc) json[attribute] = json[attribute] + "-" + bc;
        } else if (componentCharsInit == DB) {
            let cluster = await getBC(NORMAL_CLUSTER + component);
            if (cluster) json[attribute] = json[attribute] + "-" + cluster;
        }
    }
    arrayOfArrays.push(json);
}

//pushJson function,  push new json into global array 'arrayOfArrays' with BE-BC, time and cost added.
const pushJsonBEWithBC = async function (json) {
    let be = json[1];
    for (var attribute in json) { //iterate attributes      
        let component = json[attribute];
        let cost = await getCost(AFECT + component);
        if (cost) json[attribute] = component + cost;
        else if (component.substring(0, 2) != DB)
            json[attribute] = component + NOHITS;  //in this case it is different a DB.        
        //else json[attribute] = component;  //else is unnecessary because json object has simple values yet (case of DB). 
    }
    let bc = await getBC(NORMAL_BC + be);
    if (bc) json[1] = json[1] + "-" + bc;
    arrayOfArrays.push(json);
}

//prepareRecursiveOnlyAType function, prepares params before call the recursive methods that finds only a component type, not all. 
const prepareRecursiveOnlyAType = async function (component, index) {
    const allComponentsSet = new Set();

    if (componentTypeToSearch == 'BE&DB') { // BE & DB
        componentTypeToSearch = BE;  // find Different BE's        
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextComponents(allComponentsSet); // find DB
    } else if (componentTypeToSearch == 'ADS&TX') { // ADS & SA & TX
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextComponentsType(allComponentsSet, TX);
    } else if (componentTypeToSearch == BC) { // ADS & SA & TX
        componentTypeToSearch = BE; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextBC(allComponentsSet); // find DB &(allComponentsSet); // find BC      
    } else if (componentTypeToSearch == SA) { // ADS & SA & TX
        componentTypeToSearch = ADS; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextSA(allComponentsSet); // find DB &(allComponentsSet); // find BC   
    } else if (componentTypeToSearch == 'BE&ADS') { // ADS & SA & TX
        componentTypeToSearch = BE; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);;
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await saveSetComponents(allComponentsSet);
    } else if (componentTypeToSearch == 'BEDB&ADSTX') { // ADS & SA & TX
        componentTypeToSearch = BE; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);;
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextTXorDB(allComponentsSet);
    } else if (componentTypeToSearch == 'ADS&TX&SA') { // ADS & SA & TX
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextComponents(allComponentsSet); // find SA or TX     
    } else if (componentTypeToSearch == 'BE&ADSALL') { // ADS & SA & TX
        componentTypeToSearch = BE; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await findNextTXorDB(allComponentsSet);
    } else if (componentTypeToSearch == 'BC&BE&DB') { // BC & BE & DB
        componentTypeToSearch = BE;  // find Different BE's    
        await findReverseBEFromBC(allComponentsSet); // find DB & DC                 
        await findNextComponents(allComponentsSet); // find DB
    } else if (componentTypeToSearch == 'CLU&DB') {
        componentToSearch = componentToSearch.substring(3, componentToSearch.length);
        componentTypeToSearch = DB;  // find Different BE's    
        await findReverseDBFromCluster(allComponentsSet); // find DB & DC                 
        await saveSetComponents(allComponentsSet);
        //await findNextComponents(allComponentsSet); // find DB        
    } else { //Other types, normal way.
        await recursiveOnlyAType(component, allComponentsSet, index);
        await saveSetComponents(allComponentsSet);
    }
}


/* ******************************
 * RECURSIVE FUNCTIONS
 ********************************/

//recursiveMethodGeneral function, general recursive method that find all components types, is the normal case. 
const recursiveMethodGeneral = async function (component, jsonPrev, index) {
    index++;  // we add index before for.        
    let json = await saveComponentToJson(component, { ...jsonPrev }, index); //add component to json   // Spread for create a new json object , if not we could override the others
    if (index < levelSearch) {
        let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
        if (arrayComponents.length == 0) {
            if (Object.keys(json).length) await pushJson(json); //add json to global array            
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship              
                if (await existComponentInJson(nextComponent, json)) { //cancel the work because we found this component previously (it's recursive).                   
                    let jsonToSave = await saveComponentToJson(LOOP_IN + nextComponent, { ...json }, index); //we have to create a new instance of json because is a for loop.                            
                    await pushJson(jsonToSave); //add json to global array                    
                } else { //continue work                   
                    await recursiveMethodGeneral(nextComponent, json, index);
                }
            }
        }
    } else {
        if (Object.keys(json).length) await pushJson(json); //add json to global array
    }
}



//recursiveOnlyAType function, recursive method that find only a component type, not all.  
const recursiveOnlyAType = async function (component, allComponentsSet, index) {
    index++;  // we add index before for.
    if (index != 0 && component.substring(0, 2) == componentTypeToSearch) {  //first is unnecessary in this type search
        await allComponentsSet.add(component); //add component to set
    } else {
        if (index < levelSearch) {
            let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (!allComponentsSet.has(nextComponent)) { //cancel the work because we found this component previously (it's recursive).
                        await recursiveOnlyAType(nextComponent, allComponentsSet, index);
                    }
                }
            }
        }
    }
}

//recursiveMethodWithoutS function,  recursive method that find all components without SI's.  
const recursiveMethodWithoutSI = async function (component, json, index) {
    index++;  // we add index before for.
    if (component.substring(0, 2) != SI)
        json = await saveComponentToJsonInLastPos(component, json);

    if (index < levelSearch) {
        let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
        if (arrayComponents.length == 0) {
            if (Object.keys(json).length > 1) await pushJson(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                if (await existComponentInJson(nextComponent, json)) { //cancel the work because we found this component previously (it's recursive).
                    if (component.substring(0, 2) != SI) {
                        let jsonToSave = await saveComponentToJsonInLastPos(LOOP_IN + nextComponent, { ...json }); //we have to create a new instance of json because is a for loop. 
                        //await saveComponentToJson(LOOP_IN + nextComponent, jsonToSave, index); //unnecessary create a new json because if we cancel, only save one more.                           
                        await pushJson(jsonToSave); //add json to global array                    
                    }
                } else { //continue work                   
                    await recursiveMethodWithoutSI(nextComponent, { ...json }, index);
                }
            }
        }
    } else {
        if (Object.keys(json).length > 1) await pushJson(json); //add json to global array
    }
}


//findNextComponents function, return array with next components 
const findNextComponents = async function (componentsSet) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    await pushJson({ "0": componentToSearch, "1": component, "2": nextComponent });
                }
            } else {
                await pushJson({ "0": componentToSearch, "1": component });
            }
        }
    } else await pushJson({ "0": componentToSearch });
}

//findNextComponentsWithBC function, return array with next BE components With BC
const findNextComponentsWithBC = async function (componentsSet) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship                    
                    await pushJsonBEWithBC({ "0": componentToSearch, "1": component, "2": nextComponent });
                }
            } else {
                await pushJsonBEWithBC({ "0": componentToSearch, "1": component });
            }
        }
    } else await pushJson({ "0": componentToSearch });
}



//findReverseBE function,  return array with next components and BE-BC
const findReverseBEFromBC = async function (allComponentsSet) {
    let arrayComponents = await getAllComponents(REVERSE_BC + componentToSearch); //find components with relationship    
    if (arrayComponents.length != 0) {
        let iterator = arrayComponents.values();
        for (let nextComponent of iterator) { //iterate components with relationship            
            if (nextComponent) await allComponentsSet.add(nextComponent);
        }
    }
}

//findReverseBE function,  return array with next components and BE-BC
const findReverseDBFromCluster = async function (allComponentsSet) {
    let arrayComponents = await getAllComponents(REVERSE_CLUSTER + componentToSearch); //find components with relationship    
    if (arrayComponents.length != 0) {
        let iterator = arrayComponents.values();
        for (let nextComponent of iterator) { //iterate components with relationship            
            if (nextComponent) await allComponentsSet.add(nextComponent);
        }
    }
}

//findReverseBE function,  return array with next components and BE-BC
const findReverseSAFromADS = async function (allComponentsSet) {
    let arrayComponents = await getAllComponents(REVERSE_SA + componentToSearch); //find components with relationship    
    if (arrayComponents.length != 0) {
        let iterator = arrayComponents.values();
        for (let nextComponent of iterator) { //iterate components with relationship            
            if (nextComponent) await allComponentsSet.add(nextComponent);
        }
    }
}

//findNextBC function,  return array with next components and BE-BC
const findNextBC = async function (componentsSet) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let bc = await getBC(NORMAL_BC + component);
            if (bc) await pushJson({ "0": componentToSearch, "1": component, "2": bc });
            else await pushJson({ "0": componentToSearch, "1": component });
        }
    } else await pushJson({ "0": componentToSearch });
}



//findNextSA function,  return array with next components and ADS-SA
const findNextSA = async function (componentsSet) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponent = await getAllComponents(NORMAL_SA + component);
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let componentSA of iterator) {
                    await pushJson({ "0": componentToSearch, "1": component, "2": componentSA });
                }
            } else {
                await pushJson({ "0": componentToSearch, "1": component });
            }
        }
    } else await pushJson({ "0": componentToSearch });
}


//findNextTX function, return array with next Type components 
const findNextComponentsType = async function (componentsSet, type) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let nofind = true;
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (nextComponent.substring(0, 2) == type) {
                        await pushJson({ "0": componentToSearch, "1": component, "2": nextComponent });
                        nofind = false;
                    }
                }
                if (nofind) await pushJson({ "0": componentToSearch, "1": component });
            } else {
                await pushJson({ "0": componentToSearch, "1": component });
            }
        }
    } else await pushJson({ "0": componentToSearch });
}


//findNextTXorDB function, recursive method that find only a component type, not all.  
const findNextTXorDB = async function (componentsSet) {
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let nofind = true;
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (nextComponent.substring(0, 2) == TX || nextComponent.substring(0, 2) == DB) {
                        await pushJson({ "0": componentToSearch, "1": component, "2": nextComponent });
                        nofind = false;
                    }
                }
                if (nofind) await pushJson({ "0": componentToSearch, "1": component });
            } else {
                await pushJson({ "0": componentToSearch, "1": component });
            }
        }
    } else await pushJson({ "0": componentToSearch });
}



const saveSetComponents = async function (componentsSet) {
    if (componentsSet.size) {
        for (let nextComponent of componentsSet) {
            await pushJson({ "0": componentToSearch, "1": nextComponent });
        }
    } else await pushJson({ "0": componentToSearch });
}




/* //recursiveOnlyDB function, recursive method that find only the BE component type, not all. 
const recursiveOnlyDB = async function (component, jsonPrev, allComponentsSet, index) {
    let json = { ...jsonPrev }; // we need new json object        
    index = index + 1;  // we add index before for.
    if (component.indexOf('.') == -1) {  //is it a DB?
        await allComponentsSet.add(component); //add component to set
    } else {
        if (index < levelSearch) {
            let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (await existComponentInJson(nextComponent,json)) { //cancel the work because we found this component previously (it's recursive).
                        if (component.indexOf('.') == -1) await allComponentsSet.add(component);
                    } else { //continue work                   
                        await recursiveOnlyDB(nextComponent, json, allComponentsSet, index);
                    }
                }
            }
        }
    }
} */


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

/* ******************************
 * CLI PROMPT FUNCTION
 ********************************/
//getResponsePrompts function, for get the user response before searching.
const getResponsePrompts = async () => {

    //withMethod
    response.withMethod = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Do you want search by component or by method?',
        choices: [
            { title: 'Only Component, without method.', value: 1 },
            { title: 'By method, component with method.', value: 0 },
            { title: 'Find all methods that a specific component contains.', value: 2 }
        ],
        initial: 0
    })).value;


    let example = '(e.g. CA.OFI.MenusTerminal)';
    if (response.withMethod == 0) example = '(e.g. CA.OFI.Home.cargarHome)'

    //componentToSearch
    response.componentToSearch = (await prompts({
        type: 'text',
        name: 'value',
        message: 'Enter the component to search? ' + example,
        validate: value => !value ? `You need to enter a component` : true,
    })).value.trim();


    if (response.withMethod < 2) {

        charsInit = response.componentToSearch.substring(0, 2);
        //console.log(charsInit);
        //order if it's not a CA
        if (charsInit != CA && charsInit != XM && charsInit != BC && charsInit != DB && charsInit != SA && charsInit != CL && charsInit != SY && charsInit != SE) {
            response.order = (await prompts({
                type: 'select',
                name: 'value',
                message: 'Choose the direction',
                choices: [
                    { title: 'Normal: CA->SI->SN->BE->DB/SA', value: true },
                    { title: 'Reverse: DB/SA->BE->SN->SI->CA', value: false },
                ],
                initial: 0
            })).value;
        } else if (charsInit == CA || charsInit == XM || charsInit == SE) response.order = true; //normal
        else response.order = false;




        //console.log(response.order);

        if (charsInit != BC && charsInit != CL) { //Only I need find the BE.xxx
            response.componentTypeToSearch = (await prompts({
                type: 'select',
                name: 'value',
                message: 'What is the component type you want to look for?',
                choices: [
                    { title: 'ALL Components', value: ALL },
                    { title: 'CA (first)', value: CA },
                    { title: 'XMLAPP', value: XM },
                    { title: 'PNPE', value: PN },
                    { title: 'SE', value: SE },
                    { title: 'SI (first)', value: SI },
                    { title: 'SN (first)', value: SN },
                    { title: BE, value: BE },
                    { title: 'ADS', value: AD },
                    { title: TX, value: TX },
                    { title: SA, value: SA },
                    { title: DB, value: DB },
                    { title: BC, value: BC },
                    { title: 'BE/DB', value: 'BE&DB' },
                    { title: 'ADS/TX', value: 'ADS&TX' },
                    { title: 'ADS/TX/SA', value: 'ADS&TX&SA' },
                    { title: 'BE/DB & ADS/TX', value: 'BEDB&ADSTX' },
                    { title: 'BE/DB & TX/ADS/SA', value: 'BE&ADSALL' },
                    { title: 'TA', value: 'TA' },
                ],
                initial: 0
            })).value;
        } else if (charsInit == BC) { //BC
            response.componentTypeToSearch = 'BC&BE&DB'; //Only I need find the BE.xxx, DB.xxx because user print BC...
        } else if (charsInit == CL) { //Cluster
            response.componentTypeToSearch = 'CLU&DB';
        } else {  //default
            response.componentTypeToSearch = 'ALL';
        }

        //console.log(response.componentTypeToSearch + " " + response.order + " " + charsInit + " ")
        if (response.componentTypeToSearch == ALL) {
            if (response.order && (charsInit == CA || charsInit == PN || charsInit == XM || charsInit == SI || charsInit == SE)) {  //for CA to forward       
                response.skipSI = (await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Do you want to skip SI?',
                    choices: [
                        { title: 'NO', value: false },
                        { title: 'YES', value: true },
                    ],
                    initial: false
                })).value;
            } else if (!response.order && charsInit != SI && charsInit != PN) { //for other case 
                response.skipSI = (await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Do you want to skip all SI?',
                    choices: [
                        { title: 'NO', value: false },
                        { title: 'YES', value: true },
                    ],
                    initial: false
                })).value;
            } else response.skipSI = false;
        } else response.skipSI = false;

        response.levelSearch = (await prompts({
            type: 'number',
            name: 'value',
            message: 'Choose depth Level in search (1-7). Performance decrease with higher numbers.',
            validate: value => value < 1 ? `increase number please` : true,
            initial: 5
        })).value;

    } else {
        response.order = true;
        response.componentTypeToSearch = METHODS;
        response.skipSI = false;
        response.levelSearch = 1;
    }

    response.withCostOfComponent = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Do you want load cost per component?',
        choices: [
            { title: 'NO', value: false },
            { title: 'YES', value: true },
        ],
        initial: false
    })).value;

}


/* ******************************
 * INIT PROGRAM
 ********************************/
//init();

module.exports = { init }