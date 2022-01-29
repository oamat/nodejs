"use strict";

/*
 * This program load Corrections directly*        
 *  
 * 
 * */

/* ******************************
 * CONST & VARS 
 ********************************/
//DEPENDENCIES
const redis = require("redis");

//CONST
const NORMAL = 'n_'; //for changeNextComponentsIfSN method, by the way is a SI
const REVERSE = 'r_';
const NORMAL_ME = 'nm_';
const REVERSE_ME = 'rm_';

var arrayInputs = [
    { component1: 'SI.MCA.AhorroCtoMulticanal', component2: 'SI.MCA.GestioMultifirma' },
    { component1: 'SI.MCA.GestioMultifirma', component2: 'SI.MCA.GestioMultifirma' }
];

var arrayInputsMethod = [
    { component1: 'SI.MCA.AhorroCtoMulticanal.cercarLlistaMovs', component2: 'SI.MCA.GestioMultifirma.validarMtf' },
    { component1: 'SI.MCA.GestioMultifirma.validarMtf', component2: 'SI.MCA.GestioMultifirma.monitorSalida' }
];


//REDIS CONFIG & INITIALITATION
//const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
const client = redis.createClient({ host: '127.0.0.1', port: '6379' });
client.on("error", function (error) {  //little test
    console.error(error);
});

/* ******************************
 * INIT PROGRAM
 ********************************/
//init function, calls all CSV load method methods. 
const init = async function () {
    loadComponents(arrayInputs, NORMAL, REVERSE);
    loadComponents(arrayInputsMethod, NORMAL_ME, REVERSE_ME);
}

/* ******************************
 * UTIL PROGRAM
 ********************************/
//loadComponents function, load in redis new component relationship
const loadComponents = async function (arrayComponents, normalPrefix, reversePrefix) {
    for (let i = 0; i < arrayComponents.length; i++) {
        client.sadd(normalPrefix + arrayComponents[i].component1, arrayComponents[i].component2);
        client.sadd(reversePrefix + arrayComponents[i].component2, arrayComponents[i].component1);
    }
}


/* ******************************
 * INIT CALL
 ********************************/
//init();
module.exports = { init }