'use strict';

/* Components RELATIONSHIP LOADER
 * This program load CSV files into Redis with all cost components, it is based on several CSV or any repository.  *        
 *  * It is 100% async and we use promises. 
 *  * The program load each relation with Sets (CA <-> SI, SI <-> SN, SN <-> BE, BE <-> DB,... 
 */

/* ******************************
 * CONST & VARS 
 ********************************/
//DEPENDENCIES
const monitoringLoader = require('./loads/loadCostMon');
const componentLoader = require('./loads/loadComponents');
const HOSTLoad = require('./loads/loadHOST');
const methodLoader = require('./loads/loadMethods');
const idsLoader = require('./loads/loadIDs');
const idsBrokenLoad = require('./loads/loadIDsBroken');
const SEsLoad = require('./loads/loadSEs');
const CorrectionsLoader = require('./loads/loadCorrections');
const TablePSBLoader = require('./loads/loadTablesPSBHOST');


/* ******************************
 * INIT LOAD PROGRAM 
 ********************************/

//init function, calls all CSV load method methods. 
const init = async function () { //DON'T CHANGE ORDER
    
    console.log('\x1b[33m', 'Starting Monitoring Loader...');
    await monitoringLoader.init();
    console.log('\x1b[33m', 'Starting Component Loader...');
    await componentLoader.init();
    console.log('\x1b[33m', 'Starting Method Loader...');    
    await methodLoader.init();
    console.log('\x1b[33m', 'Starting IDS Loader...');
    await idsLoader.init();
    console.log('\x1b[33m', 'Starting Broken IDS Loader...');
    await idsBrokenLoad.init();    
    console.log('\x1b[33m', 'Starting SEs Loader...');
    await SEsLoad.init();   
    console.log('\x1b[33m', 'Starting HOST Loader...');
    await HOSTLoad.init();
    console.log('\x1b[33m', 'Starting Corrections Loader...');
    await CorrectionsLoader.init();
    console.log('\x1b[33m', 'Starting Table-PSB Loader...');
    await TablePSBLoader.init();



    console.log('\x1b[32m', 'FINISH ALL LOADERS');    
    
}

/* ******************************
 * INIT CALL
 ********************************/
init();