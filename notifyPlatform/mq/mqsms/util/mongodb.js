/*
 * mongodb util for notify platform. 
 *
 */

"use strict";

//Dependencies


//this method save SMS to mongoDB and manage the result of this operation
const saveSMS = async (sms) => {
    return new Promise((resolve, reject) => {
        sms.save((error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to save SMS to MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save SMS to MongoDB                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
}


//this method save PNS to mongoDB and manage the result of this operation
const savePNS = async (pns) => {
    return new Promise((resolve, reject) => {
        pns.save((error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to save PNS to MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save PNS to MongoDB                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
}


module.exports = { saveSMS, savePNS  }