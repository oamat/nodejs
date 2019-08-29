/*
 * mongodb util for notify platform. 
 *
 */

"use strict";

//Dependencies
const Sms = require('../models/sms');

//this method save SMS in MongoDB and manage the result of this operation
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


//this method update SMS Status in MongoDB and manage the result of this operation
const updateSMSStatus = async (id, status) => {
    return new Promise((resolve, reject) => {
        Sms.findOneAndUpdate({ _id: id }, {
            $set: {
                status,  //0:notSent, 1:Sent, 2:confirmed 3:Error
                dispatched: true,
                dispatchedAt: new Date()
            }
        }, { new: true }, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) console.log(error.message);
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to update SMS in MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save PNS to MongoDB
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
}

module.exports = { saveSMS, updateSMSStatus }