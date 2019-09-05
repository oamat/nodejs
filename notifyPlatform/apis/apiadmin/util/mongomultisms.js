/*
 * mongodb Multi SMS for notify platform. 
 *
 */

"use strict";

//Dependencies
const { Sms } = require('../config/mongoosemulti');  // Attention : this Sms Model is model created for multi DB


//this method find SMS in SMS MongoDB and manage the result of this operation
const findSMS = async (condition) => {
    return new Promise((resolve, reject) => {      
        Sms.find(condition, (error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. 
                else if (result) resolve(result); // everything is OK, return result                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here

}

module.exports = { findSMS }