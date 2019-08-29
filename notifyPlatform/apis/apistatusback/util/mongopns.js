/*
 * mongodb util for notify platform. 
 *
 */

"use strict";

//Dependencies
const Pns = require('../models/pns');

//this method save PNS in MongoDB and manage the result of this operation
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



//this method update PNS Status in MongoDB and manage the result of this operation
const updatePNSStatus = async (id, status) => {
    return new Promise((resolve, reject) => {
        Pns.findOneAndUpdate({ _id: id }, {
            $set: {
                status,  //0:notSent, 1:Sent, 2:confirmed 3:Error
                dispatched: true,
                dispatchedAt: new Date()
            }
        }, { new: true }, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter
                if (error) console.log(error.message);
                else console.log(" update PNS : " + JSON.stringify(result));
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
}


module.exports = { savePNS, updatePNSStatus }