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
 * DEPENDENCIES
 ********************************/

const fs = require('fs');
const csv = require('@fast-csv/parse');
const redis = require("redis");
const { writeToPath } = require('@fast-csv/format');
const path = require('path');
const { exit } = require('process');
//const { exit } = require('process');
//const { table } = require("console");


const choices = [
    { title: 'ALL Components', value: 'ALL' }, //0
    { title: 'CA (first)', value: 'CA' }, //1
    { title: 'XMLAPP', value: 'XM' }, //2
    { title: 'PNPE', value: 'PN' }, //3
    { title: 'SE', value: 'SE' }, //4
    { title: 'SI (first)', value: 'SI' }, //5
    { title: 'SN (first)', value: 'SN' }, //6
    { title: 'BE', value: 'BE' }, //7
    { title: 'ADS', value: 'AD' }, //8
    { title: 'TX', value: 'TX' }, //9
    { title: 'SA', value: 'SA' }, //10
    { title: 'DB', value: 'DB' }, //11
    { title: 'BE/DB', value: 'BE&DB' }, //12
    { title: 'BE/BC', value: 'BE&BC' }, //13
    { title: 'BE/DB/BC', value: 'BE&DB&BC' }, //14
    { title: 'ADS/TX', value: 'ADS&TX' }, //15
    { title: 'ADS/TX/SA', value: 'ADS&TX&SA' }, //16
    { title: 'BE/DB & ADS/TX', value: 'BEDB&ADSTX' }, //17
    { title: 'BE/DB & TX/ADS/SA', value: 'BE&ADSALL' }, //18
    { title: 'TA', value: 'TA' }, //19
];


/* ******************************
 * CONST & VARS 
 ********************************/

//CONST to USE: THE CONFIG. (TODO: extract config in a file)
const toLoad = {
    CSVInput: { doc: 'filename.csv', Col0: 0, Col1: 1, Col2: 2, Col3: 3, Col4: 4, Col5: 5, Col6: 6, Col7: 7, Col8: 8 }
};


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
const POINT = '.';
const BE = 'BE';
const BEP = 'BE.';
const CA = 'CA';
const CAP = 'CA.';
const SE = 'SE';
const SEP = 'SE.';
const SI = 'SI';
const SIP = 'SI.';
const SN = 'SN';
const SNP = 'SN.';
const DB = 'DB';
const DBP = 'DB.';
const DBE = 'DBE';
const BC = 'BC';
const BCP = 'BC.';
const ADS = 'ADS';
const XMLAPP = 'XMLAPP';
const XML = 'XML';
const PNPE = 'PNPE';
const PNP = 'PNP';
const TX = 'TX';
const TXP = 'TX.';
const SA = 'SA';
const SAP = 'SA.';
const SYS = 'SYS';
const SYSP = 'SYS.';
const PSB = 'PSB';
const PSBP = 'PSB.';
const TA = 'TA';
const TAP = 'TA.';
const CLUSTER = 'CLUSTER';
const CL = 'CL';
const CLP = 'CL.';
const ALL = 'ALL';
const INDEX_SI = 'INDEX_SI';
const INDEX_SN = 'INDEX_SN';
const INDEX_CA = 'INDEX_CA';
const FIRST = 'FIRST';
const INPUT = 'INPUT';
const DESCRIPTION = 'DESCRIPTION';
const METHODS = 'METHODS';
const NOHITS = '(noHits/0)';
const LOOP_IN = '<-**LOOP_IN:';
const INVERS_ARROW = '<-*';
const ERROR_LOOP = 'ERROR_LOOP';
const NOARQ_COMPONENT = 'NOARQ_COMPONENT';
const DF1 = "DF1";
const DF2 = "DF2";
const DF3 = "DF3";
const DF4 = "DF4";
const DF5 = "DF5";
const IDPALANCA = "ID.PALANCA";
const TIPO = "TIPO";

//vars & ARGUMENTS
const noCostComponent = new Set([DB, BC, SYS, TA, PSB, CLUSTER, ERROR_LOOP, NOARQ_COMPONENT, TX, SA, DESCRIPTION, TIPO, DF1, DF2, DF3, DF4, DF5, IDPALANCA, PNPE, XMLAPP, ADS]);


// CLI PROMPT RESPONSE VARS
var client; //Redis client


var levelSearch;
var order;
var addTypeToComponent;
var skipSI;
var searchMethod;
var componentToSearch;
var componentInfo;
var componentTypeToSearch;
var outputAllInOneCSV;
var outputCSVName;
var inputWithCSV;
var palancasMitigacion;
var outputIDEINSFile;
var deactivationTypeComponent;
var withCostOfComponent;
var outputCSVNameIDEINS;
var outputComponentWithOperation;

var SetForOutputIDEINSFile = new Set();
var arraySearchComponents = [];

var headersForCSV = new Set();
var headersForCSVIndexCA = 0;
var headersForCSVIndexSI = 0;
var headersForCSVIndexSN = 0;



// PREPARED VARS FROM CLI PROMPT RESPONSE VARS
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
        console.log('\x1b[31m', 'ERROR : Redis bad config ' + RedisIP + ':' + RedisPort);
        console.error('ERROR : Redis bad config ' + RedisIP + ':' + RedisPort);
        exit(1);
    }
    //END  ACCESS TEST REDIS*/
}


/* ******************************
 * START BATCH MODIFICATIONS
 ********************************/
const initVars = function () {
    arrayOfArrays = [];
    SetForOutputIDEINSFile = new Set();
    arraySearchComponents = [];
    headersForCSV = new Set();
    headersForCSVIndexCA = 0;
    headersForCSVIndexSI = 0;
    headersForCSVIndexSN = 0;
}


/* ******************************
 * BATCH INIT & CONFIG
 ********************************/

//init function, itconfigures properties and then calls recursive methods for search. 
const batchInit = async function (config) {

    initVars();
    await initRedis(config.RedisIP, config.RedisPort);

    //1.INPUT TYPE & CONFIG
    inputWithCSV = config.inputWithCSV; //we take inputs from /results/input/[filename].csv?
    toLoad.CSVInput.doc = config.fileInputCSV; //file input name, Only in case inputWithCSV = true;

    palancasMitigacion = config.palancasMitigacion;
    addTypeToComponent = config.addTypeToComponent;
    //2.SEARCH TYPE & CONFIG
    levelSearch = config.levelSearch; //level search
    order = config.order; //true normal, false reverse
    skipSI = config.skipSI; //unnecessary
    componentTypeToSearch = choices[config.componentTypeToSearch].value; //Filter type, see choises constant    
    searchMethod = config.searchMethod //Component with operation? 0 = wit Method, 1 WithoutMethod, 2 Only Method reference
    //3.OUTPUT TYPE & CONFIG
    outputAllInOneCSV = config.outputAllInOneCSV; //true : in 1, false: in N CSV
    outputCSVName = config.outputCSVName; //Only in case outputAllInOneCSV = true
    //4.ABSIS IDEINS DEACTIVATION
    outputIDEINSFile = config.outputIDEINSFile;  //Specific of ABSIS: if you want generate a IDEINS file for deactivation components
    deactivationTypeComponent = config.deactivationTypeComponent;  //Specific of ABSIS: if you want generate a IDEINS file for deactivation components
    withCostOfComponent = config.withCostOfComponent
    outputCSVNameIDEINS = config.outputCSVNameIDEINS;
    outputComponentWithOperation = config.outputComponentWithOperation; //Specific of ABSIS: deactivate operation component IDEINS, Only for CAs, SIs and SNs if searchMethod is 0 (with method)

    if (inputWithCSV)
        if (palancasMitigacion) arraySearchComponents = await loadCSVPalancas(toLoad.CSVInput);
        else arraySearchComponents = await loadCSV(toLoad.CSVInput);
    else { //write here the components to search if you prefer than file option
        arraySearchComponents = config.arrayInputs;
    }

    await batchSearch();
    return (arrayOfArrays.length);
}


/* ******************************
 * BATCH SEARCH EXECUTION
 ********************************/

//batchSearch function, the main batch proces for search components
const batchSearch = async function () {

    console.log('\x1b[37m', 'Starting search of relations.........');

    if (outputAllInOneCSV) {
        let componentTypeToSearchPrevious = componentTypeToSearch; //Important because some methods change componentTypeToSearch inside for
        for (let i = 0; i < arraySearchComponents.length; i++) {
            componentTypeToSearch = componentTypeToSearchPrevious; //Important because some methods change componentTypeToSearch inside for
            componentToSearch = arraySearchComponents[i].component;
            componentInfo = arraySearchComponents[i];
            await init();
        }
        await saveSearch(outputCSVName, arrayOfArrays);
    } else {
        let componentTypeToSearchPrevious = componentTypeToSearch; //Important because some methods change componentTypeToSearch
        for (let i = 0; i < arraySearchComponents.length; i++) {
            arrayOfArrays = [];
            componentTypeToSearch = componentTypeToSearchPrevious; //Important because some methods change componentTypeToSearch
            componentToSearch = arraySearchComponents[i].component;
            componentInfo = arraySearchComponents[i];
            await init();
            await saveSearch(componentToSearch, arrayOfArrays);
        }
    }

    if (outputIDEINSFile) await saveIDEINSToCSV(outputCSVNameIDEINS, SetForOutputIDEINSFile);

    console.log('\x1b[32m', 'All CSV Files have been created correctly .');

    //process.exit(1);
}

//saveSearch function, save results to the file
const saveSearch = async function (fileName, arrayOfArrays) {
    if (order)
        await saveSearchToCSV(fileName, arrayOfArrays);
    else
        await saveSearchToCSVReverse(fileName, arrayOfArrays);
}



/* ******************************
 * INIT PROGRAM
 ********************************/

//init function, it launchs the prompt and later calls recursive methods. 
const init = async function () {

    //console.log('\x1b[37m', 'Search element : ' + componentToSearch + ' Wait while Searching .........');
    let componentCharsInit = componentToSearch.substring(0, 2);

    if (componentTypeToSearch == ALL) {
        for (let i = 0; i <= levelSearch; i++) headersForCSV[i] = i;  //generate all table headers         
        if (componentCharsInit == BC) { //BC
            componentTypeToSearch = 'BC&BE&DB'; //Only I need find the BE.xxx, DB.xxx because user print BC...           
        } else if (componentCharsInit == CL) { //Cluster           
            componentTypeToSearch = 'CLU&DB';
        }
    }



    let jsonIni = { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 };

    if (componentTypeToSearch != ALL && componentTypeToSearch != METHODS) { //FILTERS //calls recursive methods for type 
        if (componentTypeToSearch == CA && componentCharsInit == CA) prefixSearch = order ? NORMAL_CA : REVERSE_CA; //prefix for CA's searching CA's        
        else if (searchMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes        
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes        
        await prepareRecursiveOnlyAType(componentToSearch, -1);
    } else if (componentTypeToSearch == METHODS) { //find all methods that a specific component contains
        prefixSearch = NORMAL_COMPMEHOD;  //change prefixSearch     
        await recursiveMethodGeneral(componentToSearch, jsonIni, -1); //normal way
    } else if (skipSI) { //IF WE WANT SKIP SI'S
        if (searchMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes
        await recursiveMethodWithoutSI(componentToSearch, jsonIni, -1);
    } else { //ALL COMPONENTS SEARCH
        if (searchMethod == 0) prefixSearch = order ? NORMAL_ME : REVERSE_ME;  //method normal prefixes
        else prefixSearch = order ? NORMAL : REVERSE;  //component normal prefixes
        await recursiveMethodGeneral(componentToSearch, jsonIni, -1);
    }


    if (outputAllInOneCSV)
        console.log('\x1b[36m', componentToSearch + ' search processed. Total of relations is ' + arrayOfArrays.length + '. Continue searching...');
    else
        console.log('\x1b[36m', componentToSearch + ' search processed. ' + arrayOfArrays.length + ' relations found in compopnent');

}


/* ******************************
 * END BATCH MODIFICATIONS
 ********************************/


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
const saveComponentToJson = async function (component, json) {
    let componentCharsInit = component.substring(0, 3);


    if (json[FIRST]) { //Only 1 time
        delete json.FIRST;  //Only 1 time
        json[INPUT] = component;
        if (palancasMitigacion) {
            json[TIPO] = componentInfo.tipo;
            headersForCSV.add(TIPO);
            json[DF1] = componentInfo.df1;
            headersForCSV.add(DF1);
            json[DF2] = componentInfo.df2;
            headersForCSV.add(DF2);
            json[DF3] = componentInfo.df3;
            headersForCSV.add(DF3);
            json[DF4] = componentInfo.df4;
            headersForCSV.add(DF4);
            json[DF5] = componentInfo.df5;
            headersForCSV.add(DF5);
            json[IDPALANCA] = componentInfo.idPalanca;
            headersForCSV.add(IDPALANCA);
            if (componentInfo.description) { //add description if exist.            
                json[DESCRIPTION] = componentInfo.description;
                headersForCSV.add(DESCRIPTION);
            }
        } else {
            if (componentInfo.description) { //add description if exist.            
                json[DESCRIPTION] = componentInfo.description;
                headersForCSV.add(DESCRIPTION);
            }
        }
        //headersForCSV.add(INPUT); //Unnecessary
        if (componentCharsInit == BEP) {  //If input is a BE
            if (componentTypeToSearch == 'ALL' || componentTypeToSearch == 'BE&BC' || componentTypeToSearch == 'BE&DB&BC') { //only ALL(0) BE&BC(12) or BE&BC&DB(13)
                let bc = await getBC(NORMAL_BC + component);
                if (bc) {
                    json[BC] = bc;
                    headersForCSV.add(BC);
                }
            }
        } else if (componentCharsInit == DBP) { //If input is a DB
            let cluster = await getBC(NORMAL_CLUSTER + component);
            if (cluster) {
                json[CLUSTER] = cluster;
                headersForCSV.add(CLUSTER);
            }
        }
    } else if (componentCharsInit == PNP) {
        json[PNPE] = component;
        headersForCSV.add(PNPE);
    } else if (componentCharsInit == XML) {
        json[XMLAPP] = component;
        headersForCSV.add(XMLAPP);
    } else if (componentCharsInit == CAP) {
        let index = ++json[INDEX_CA]; //add 1 before assignation              
        json[CA + index] = component; //add component to json in last position. First is 0     
        if (headersForCSVIndexCA < index) headersForCSVIndexCA = index;
        headersForCSV.add(CA);
    } else if (componentCharsInit == SEP) {
        json[SE] = component;
        headersForCSV.add(SE);
    } else if (componentCharsInit == SIP) {
        let index = ++json[INDEX_SI]; //add 1 before assignation              
        json[SI + index] = component; //add component to json in last position. First is 0     
        if (headersForCSVIndexSI < index) headersForCSVIndexSI = index;
        headersForCSV.add(SI);
    } else if (componentCharsInit == SNP) {
        let index = ++json[INDEX_SN]; //add 1 before assignation              
        json[SN + index] = component; //add component to json in last position. First is 0     
        if (headersForCSVIndexSN < index) headersForCSVIndexSN = index;
        headersForCSV.add(SN);
    } else if (componentCharsInit == BEP) {
        json[BE] = component;
        headersForCSV.add(BE);
        let bc = await getBC(NORMAL_BC + component);
        if (bc) {
            json[BC] = bc;
            headersForCSV.add(BC);
        }
    } else if (componentCharsInit == ADS) {
        json[ADS] = component;
        headersForCSV.add(ADS);
    } else if (componentCharsInit == DBP || componentCharsInit == DBE) {
        json[DB] = component;
        headersForCSV.add(DB);
        let cluster = await getBC(NORMAL_CLUSTER + component);
        if (cluster) {
            json[CLUSTER] = cluster;
            headersForCSV.add(CLUSTER);
        }
    } else if (componentCharsInit == TXP) {
        json[TX] = component;
        headersForCSV.add(TX);
    } else if (componentCharsInit == SAP) {
        json[SA] = component;
        headersForCSV.add(SA);
    } else if (componentCharsInit == PSB) {
        json[PSB] = component;
        headersForCSV.add(PSB);
    } else if (componentCharsInit == TAP) {
        json[TA] = component;
        headersForCSV.add(TA);
    } else if (componentCharsInit == SYS) {
        json[SYS] = component;
        headersForCSV.add(SYS);
    } else if (componentCharsInit == INVERS_ARROW) {
        json[ERROR_LOOP] = component;
        headersForCSV.add(ERROR_LOOP);
    } else {
        json[NOARQ_COMPONENT] = component;
        headersForCSV.add(NOARQ_COMPONENT);
    }

    return json;
}

//pushJson function,  push new json into global array 'arrayOfArrays' with the time and cost added.
const pushJson = async function (json) {
    //console.log(json); 
    delete json.INDEX_CA; // now I am sure we have only Strings in that json
    delete json.INDEX_SI; // now I am sure we have only Strings in that json
    delete json.INDEX_SN; // now I am sure we have only Strings in that json
    for (var attribute in json) { //iterate attributes    
        //IDEINS DEACTIVATION FILE: before cost we have to save the IDEINS FIle if is needed.
        if (outputIDEINSFile) {
            if (attribute == deactivationTypeComponent) {
                SetForOutputIDEINSFile.add(json[attribute]);
            }
        }

        //COST OF COMPONENTS    
        if (withCostOfComponent) {
            if (attribute == INPUT) {           //COST OF INPUT COMPONENT
                let component = json[attribute];
                let charInit = component.substring(0, 3);
                if (charInit == SEP || charInit == SIP || charInit == SNP || charInit == CAP || charInit == BEP) {
                    let cost = await getCost(AFECT + component);
                    if (cost) json[attribute] = component + cost;
                    else json[attribute] = component + NOHITS;  //in this case it is different a DB. 
                }
            } else if (!noCostComponent.has(attribute)) {   //COST OF OTHER COMPONENTS
                let component = json[attribute];
                let cost = await getCost(AFECT + component);
                if (cost) json[attribute] = component + cost;
                else json[attribute] = component + NOHITS;  //in this case it is different a DB.        
            }
        }
    }

    arrayOfArrays.push(json);
}


//prepareRecursiveOnlyAType function, prepares params before call the recursive methods that finds only a component type, not all. 
const prepareRecursiveOnlyAType = async function (component, index) {
    let allComponentsSet = new Set();
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
        await recursiveOnlyAType(component, allComponentsSet, index);
        componentTypeToSearch = AD; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
        await saveSetComponents(allComponentsSet);
    } else if (componentTypeToSearch == 'BEDB&ADSTX') { // ADS & SA & TX
        componentTypeToSearch = BE; //find Differents ADS's
        await recursiveOnlyAType(component, allComponentsSet, index);
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
    } else { //Other types, normal way.
        await recursiveOnlyAType(component, allComponentsSet, index);
        await saveSetComponents(allComponentsSet);
    }
}


/* ******************************
 * RECURSIVE FUNCTIONS
 ********************************/

//recursiveMethodGeneral function, general recursive method that find all components types, is the normal case. 
const recursiveMethodGeneral = async function (component, json, index) {
    index++;  // we add index before for.            
    json = await saveComponentToJson(component, json); //add component to json   // Spread for create a new json object , if not we could override the others   
    if (index < levelSearch) {
        let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
        if (arrayComponents.length == 0) {
            await pushJson(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                if (await existComponentInJson(nextComponent, json)) { //cancel the work because we found this component previously (it's recursive).                   
                    let jsonToSave = await saveComponentToJson(LOOP_IN + nextComponent, { ...json }); //we have to create a new instance of json because is a for loop.                           
                    await pushJson(jsonToSave); //add json to global array
                } else { //continue work                       
                    await recursiveMethodGeneral(nextComponent, { ...json }, index); // Create a new Json Instance   
                }
            }
        }
    } else {
        await pushJson(json); //add json to global array
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
        json = await saveComponentToJson(component, json);

    if (index < levelSearch) {
        let arrayComponents = await getAllComponents(prefixSearch + component); //find components with relationship
        if (arrayComponents.length == 0) {
            if (Object.keys(json).length > 1) await pushJson(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                if (await existComponentInJson(nextComponent, json)) { //cancel the work because we found this component previously (it's recursive).
                    if (component.substring(0, 2) != SI) {
                        let jsonToSave = await saveComponentToJson(LOOP_IN + nextComponent, { ...json }); //we have to create a new instance of json because is a for loop.                       
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
    let jsonIni = await saveComponentToJson(componentToSearch, { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 }); //Create first json with first element 
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship                      
                    let json = await saveComponentToJson(component, { ...jsonIni });
                    json = await saveComponentToJson(nextComponent, json);
                    await pushJson(json);
                }
            } else {
                let json = await saveComponentToJson(component, { ...jsonIni });
                await pushJson(json);
            }
        }
    } else await pushJson(jsonIni);
}




//findNextBC function,  return array with next components and BE-BC
const findNextBC = async function (componentsSet) {
    let jsonIni = await saveComponentToJson(componentToSearch, { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 }); //Create first json with first element 
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let json = await saveComponentToJson(component, { ...jsonIni });
            await pushJson(json);
        }
    } else await pushJson(jsonIni);
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
    let jsonIni = await saveComponentToJson(componentToSearch, { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 }); //Create first json with first element 
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let nofind = true;
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (nextComponent.substring(0, 2) == type) {
                        let json = await saveComponentToJson(component, { ...jsonIni });
                        await saveComponentToJson(nextComponent, json);
                        await pushJson(json);
                        nofind = false;
                    }
                }
                if (nofind) {
                    let json = await saveComponentToJson(component, { ...jsonIni });
                    await pushJson(json);
                }
            } else {
                let json = await saveComponentToJson(component, { ...jsonIni });
                await pushJson(json);
            }
        }
    } else await pushJson(jsonIni);
}


//findNextTXorDB function, recursive method that find only a component type, not all.  
const findNextTXorDB = async function (componentsSet) {
    let jsonIni = await saveComponentToJson(componentToSearch, { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 }); //Create first json with first element   
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let arrayComponents = await getAllComponents(prefixSearch + component);
            if (arrayComponents.length != 0) {
                let nofind = true;
                let iterator = arrayComponents.values();
                for (let nextComponent of iterator) { //iterate components with relationship
                    if (nextComponent.substring(0, 2) == TX || nextComponent.substring(0, 2) == DB) {
                        let json = await saveComponentToJson(component, { ...jsonIni });
                        json = await saveComponentToJson(nextComponent, json);
                        await pushJson(json);
                        nofind = false;
                    }
                }
                if (nofind) {
                    let json = await saveComponentToJson(component, { ...jsonIni });
                    await pushJson(json);
                }
            } else {
                let json = await saveComponentToJson(component, { ...jsonIni });
                await pushJson(json);
            }
        }
    } else await pushJson(jsonIni);
}


//saveSetComponents function, recursive method that find only a component type, not all.  
const saveSetComponents = async function (componentsSet) {
    let jsonIni = await saveComponentToJson(componentToSearch, { FIRST: true, INDEX_CA: 0, INDEX_SI: 0, INDEX_SN: 0 }); //Create first json with first element    
    if (componentsSet.size) {
        for (let component of componentsSet) {
            let json = await saveComponentToJson(component, { ...jsonIni });
            await pushJson(json);
        }
    } else await pushJson(jsonIni);
}


/* ******************************
 * REDIS FUNCTIONS , they ar into promises
 ********************************/

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
 * FILE LOAD FUNCTIONS
 ********************************/
//loadCSV function, generic CSV Loader.
const loadCSV = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let component = row[params.Col0];
                let description = row[params.Col1];
                if (component && (typeof component === 'string' || component instanceof String)) {
                    if (component.trim() != 'COMPONENT') {
                        component = addTypeToComponent + component;
                        arraySearchComponents.push({ component, description });
                    }
                }
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                resolve(arraySearchComponents);
            });
    });
}

//loadCSV function, generic CSV Loader.
const loadCSVPalancas = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let tipo = row[params.Col0];
                let df1 = row[params.Col1];
                let df2 = row[params.Col2];
                let df3 = row[params.Col3];
                let df4 = row[params.Col4];
                let df5 = row[params.Col5];
                let idPalanca = row[params.Col6];
                let component = row[params.Col7];
                let description = row[params.Col8];
                if (component && (typeof component === 'string' || component instanceof String)) {
                    if (component.trim() != 'COMPONENT') {
                        component = addTypeToComponent + component;
                        arraySearchComponents.push({ tipo, df1, df2, df3, df4, df5, idPalanca, component, description });
                    }
                }
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
                resolve(arraySearchComponents);
            });
    });
}

/* ******************************
 * Write CSV FUNCTION , they ar into promises
 ********************************/
//saveSearchToCSV function, organize columns in normal order and write all results in a File 
const saveSearchToCSV = async function (fileName, array) {
    return new Promise((resolve, reject) => {

        let headersForCSVToUnshift = {};

        if (palancasMitigacion) {
            headersForCSVToUnshift[TIPO] = TIPO;
            headersForCSVToUnshift[DF1] = DF1;
            headersForCSVToUnshift[DF2] = DF2;
            headersForCSVToUnshift[DF3] = DF3;
            headersForCSVToUnshift[DF4] = DF4;
            headersForCSVToUnshift[DF5] = DF5;
            headersForCSVToUnshift[IDPALANCA] = IDPALANCA;
            headersForCSVToUnshift[DESCRIPTION] = DESCRIPTION;
        } else {
            if (headersForCSV.has(DESCRIPTION)) headersForCSVToUnshift[DESCRIPTION] = DESCRIPTION;
        }

        headersForCSVToUnshift[INPUT] = INPUT;

        if (headersForCSV.has(XMLAPP)) headersForCSVToUnshift[XMLAPP] = XMLAPP;

        if (headersForCSV.has(SE)) headersForCSVToUnshift[SE] = SE;

        //if (headersForCSV.has(CA)) headersForCSVToUnshift[CA] = CA;
        for (let i = 1; i <= headersForCSVIndexCA; i++) {
            let ca = CA + i;
            headersForCSVToUnshift[ca] = ca;
        }

        if (headersForCSV.has(PNPE)) headersForCSVToUnshift[PNPE] = PNPE;

        //if (headersForCSV.has(SI)) headersForCSVToUnshift[SI] = SI;
        for (let i = 1; i <= headersForCSVIndexSI; i++) {
            let si = SI + i;
            headersForCSVToUnshift[si] = si;
        }

        //if (headersForCSV.has(SN)) headersForCSVToUnshift[SN] = SN;
        for (let i = 1; i <= headersForCSVIndexSN; i++) {
            let sn = SN + i;
            headersForCSVToUnshift[sn] = sn;
        }


        if (headersForCSV.has(BE)) headersForCSVToUnshift[BE] = BE;
        if (headersForCSV.has(BC)) headersForCSVToUnshift[BC] = BC;
        if (headersForCSV.has(DB)) headersForCSVToUnshift[DB] = DB;
        if (headersForCSV.has(CLUSTER)) headersForCSVToUnshift[CLUSTER] = CLUSTER;
        if (headersForCSV.has(ADS)) headersForCSVToUnshift[ADS] = ADS;
        if (headersForCSV.has(TX)) headersForCSVToUnshift[TX] = TX;
        if (headersForCSV.has(SA)) headersForCSVToUnshift[SA] = SA;
        if (headersForCSV.has(PSB)) headersForCSVToUnshift[PSB] = PSB;
        if (headersForCSV.has(TA)) headersForCSVToUnshift[TA] = TA;
        if (headersForCSV.has(SYS)) headersForCSVToUnshift[SYS] = SYS;

        //headersForCSVToUnshift = { 'INPUT': 'INPUT', '0': '0', '1': '1', '2': '2', 'BE': 'BE', 'BC': 'BC', 'DB': 'DB', 'CLUSTER': 'CLUSTER', 'ADS': 'ADS', 'TX': 'TX' }; //we need in order


        if (headersForCSV.has(ERROR_LOOP)) headersForCSVToUnshift[ERROR_LOOP] = ERROR_LOOP;

        if (headersForCSV.has(NOARQ_COMPONENT)) headersForCSVToUnshift[NOARQ_COMPONENT] = NOARQ_COMPONENT;


        array.unshift(headersForCSVToUnshift); //Prepare Headers For CSV: headers:true not work if first is less than others. 

        writeToPath(path.resolve('./results/outputs/', fileName), array, { delimiter: ';' }) //get result or error
            /*try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                 if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject   */
            .on('error', async err => {
                console.error(err);
                reject(err);
            })
            .on('finish', () => {
                if (outputAllInOneCSV) console.log('\x1b[37m', '\n-------------------------End of Search--------------------------------------------------\n');
                console.log('\x1b[34m', 'Results write in ./results/outputs/' + fileName + ' writing.');
                resolve(fileName);
            });
    });
}


//saveSearchToCSV function, organize columns in reverse order and write all results in a File  
const saveSearchToCSVReverse = async function (fileName, array) {
    return new Promise((resolve, reject) => {

        //console.table(array);
        let headersForCSVToUnshift = {};

        if (palancasMitigacion) {
            headersForCSVToUnshift[TIPO] = TIPO;
            headersForCSVToUnshift[DF1] = DF1;
            headersForCSVToUnshift[DF2] = DF2;
            headersForCSVToUnshift[DF3] = DF3;
            headersForCSVToUnshift[DF4] = DF4;
            headersForCSVToUnshift[DF5] = DF5;
            headersForCSVToUnshift[IDPALANCA] = IDPALANCA;
            headersForCSVToUnshift[DESCRIPTION] = DESCRIPTION;
        } else {
            if (headersForCSV.has(DESCRIPTION)) headersForCSVToUnshift[DESCRIPTION] = DESCRIPTION;
        }

        headersForCSVToUnshift[INPUT] = INPUT;

        if (headersForCSV.has(SYS)) headersForCSVToUnshift[SYS] = SYS;
        if (headersForCSV.has(TA)) headersForCSVToUnshift[TA] = TA;
        if (headersForCSV.has(PSB)) headersForCSVToUnshift[PSB] = PSB;
        if (headersForCSV.has(SA)) headersForCSVToUnshift[SA] = SA;
        if (headersForCSV.has(TX)) headersForCSVToUnshift[TX] = TX;
        if (headersForCSV.has(ADS)) headersForCSVToUnshift[ADS] = ADS;
        if (headersForCSV.has(DB)) headersForCSVToUnshift[DB] = DB;
        if (headersForCSV.has(CLUSTER)) headersForCSVToUnshift[CLUSTER] = CLUSTER;
        if (headersForCSV.has(BE)) headersForCSVToUnshift[BE] = BE;
        if (headersForCSV.has(BC)) headersForCSVToUnshift[BC] = BC;

        //if (headersForCSV.has(SN)) headersForCSVToUnshift[SN] = SN;
        for (let i = 1; i <= headersForCSVIndexSN; i++) {
            let sn = SN + i;
            headersForCSVToUnshift[sn] = sn;
        }



        //if (headersForCSV.has(SI)) headersForCSVToUnshift[SI] = SI;
        for (let i = 1; i <= headersForCSVIndexSI; i++) {
            let si = SI + i;
            headersForCSVToUnshift[si] = si;
        }

        if (headersForCSV.has(SE)) headersForCSVToUnshift[SE] = SE;

        //if (headersForCSV.has(CA)) headersForCSVToUnshift[CA] = CA;
        for (let i = 1; i <= headersForCSVIndexCA; i++) {
            let ca = CA + i;
            headersForCSVToUnshift[ca] = ca;
        }

        if (headersForCSV.has(PNPE)) headersForCSVToUnshift[PNPE] = PNPE;

        if (headersForCSV.has(XMLAPP)) headersForCSVToUnshift[XMLAPP] = XMLAPP;

        if (headersForCSV.has(ERROR_LOOP)) headersForCSVToUnshift[ERROR_LOOP] = ERROR_LOOP;

        if (headersForCSV.has(NOARQ_COMPONENT)) headersForCSVToUnshift[NOARQ_COMPONENT] = NOARQ_COMPONENT;

        //headersForCSVToUnshift = { 'INPUT': 'INPUT', '0': '0', '1': '1', '2': '2', 'BE': 'BE', 'BC': 'BC', 'DB': 'DB', 'CLUSTER': 'CLUSTER', 'ADS': 'ADS', 'TX': 'TX' }; //we need in order

        array.unshift(headersForCSVToUnshift); //Prepare Headers For CSV: headers:true not work if first is less than others. 

        writeToPath(path.resolve('./results/outputs/', fileName), array, { delimiter: ';' }) //get result or error
            /*try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                 if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject   */
            .on('error', async err => {
                console.error(err);
                reject(err);
            })
            .on('finish', () => {
                console.log('\x1b[36m', ' ./results/outputs/' + fileName + '.csv writing.')
                resolve(fileName);
            });
    });
}



//saveIDEINSToCSV function, organize columns and write the IDEINS ABSIS deactivate components
const saveIDEINSToCSV = async function (fileName, SetForOutputIDEINSFile) {
    return new Promise((resolve, reject) => {
                
        let headers = { 'TYPE': 'TYPE', 'COMPONENT': 'COMPONENT', 'OPERATION': 'OPERATION', 'ACTION': 'ACTION' };
        let SetForOutputSubstringIDEINSFile = new Set();

        let arrayIDEINS = [];
        for (let component of SetForOutputIDEINSFile) {
            let array = component.split(POINT);
            if (array.length == 4) { // With method: CA1 or SI1 or SN1 could have operations, it's unnecessary now
                let operation = '*';
                if (outputComponentWithOperation) operation = array[3];
                component = array[0] + POINT + array[1] + POINT + array[2];
                if (!SetForOutputSubstringIDEINSFile.has(component + operation)) {
                    arrayIDEINS.push(
                        {
                            'TYPE': array[0] + POINT + array[1],
                            'COMPONENT': component,
                            'OPERATION': operation,
                            'ACTION': 0
                        }
                    );
                    SetForOutputSubstringIDEINSFile.add(component);
                }
            } else if (array.length == 3) { //WithOut Method : CA1 or SI1 or SN1 could have operations, it's unnecessary now
                arrayIDEINS.push(
                    {
                        'TYPE': array[0] + POINT + array[1],
                        'COMPONENT': component,
                        'OPERATION': '*',
                        'ACTION': 0
                    }
                );
            } else { // array.length < 3 -> BE, DB,... 
                arrayIDEINS.push(
                    {
                        'TYPE': array[0],
                        'COMPONENT': component,
                        'OPERATION': '*',
                        'ACTION': 0
                    }
                );


            }
        }

        //array.unshift(headersForCSVToUnshift); //adds headers to the beginning of the array. Prepare Headers For CSV: headers:true not work if first is less than others. 
        writeToPath(path.resolve('./results/outputs/', fileName), arrayIDEINS, { delimiter: ';' }) //get result or error
            /*try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                 if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject   */
            .on('error', async err => {
                console.error(err);
                reject(err);
            })
            .on('finish', () => {
                if (outputAllInOneCSV) console.log('\x1b[37m', '\n-------------------------End of Search--------------------------------------------------\n');
                console.log('\x1b[34m', 'Results write in ./results/outputs/' + fileName + ' writing.');
                resolve(fileName);
            });
    });
}

/* ******************************
 * INIT PROGRAM
 ********************************/
//batchInit();

module.exports = { batchInit }