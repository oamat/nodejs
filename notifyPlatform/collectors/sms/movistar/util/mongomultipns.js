/*
 * mongodb Multi PNS for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 */

"use strict";

//Dependencies
const { Pns } = require('../config/mongoosemulti'); // Attention : this Sms Model is model created for multi DB


//this method finds one PNS with the condition in PNS MongoDB and manage the result of this operation
const findPNS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errs and results inside callbacks
        Pns().findOne(condition, (error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
                else resolve(result); // everything is OK, return result                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    })
    ////.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    ////.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All PNS with the condition in PNS MongoDB and manage the result of this operation
const findAllPNS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errs and results inside callbacks
        Pns().find(condition, (error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
                else resolve(result); // everything is OK, return result                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    })
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save SMS in MongoDB and manage the result of this operation
const saveContractPns = async (contract) => {
    return new Promise((resolve, reject) => { // we need promise for managing errs and results inside callbacks
        contract.save((error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to save PNS Contract to MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save SMS to MongoDB                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { findPNS, findAllPNS, saveContractPns }