/*
 * mongodb util for notify platform. 
 *
 */

"use strict";

//Dependencies
const { Sms } = require('../models/sms');

//this method save SMS in MongoDB and manage the result of this operation
const saveSMS = async (sms) => {
    return new Promise((resolve, reject) => {
        sms.save((error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If I use reject try/catch is unecessary  
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to save SMS to MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save SMS to MongoDB                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}


//this method update SMS in MongoDB and manage the result of this operation
const updateSMS = async (sms) => {
    return new Promise((resolve, reject) => {
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        let query = { _id: sms._id };
        Sms.findOneAndUpdate(query, sms, options, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If I use reject try/catch is unecessary  
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to update SMS in MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save SMS to MongoDB
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update SMS personalized params in MongoDB and manage the result of this operation
const updateSomeOfSMS = async (id, toUpdate) => {
    return new Promise((resolve, reject) => {
        let options = { new: true };
        let query = { _id: id };
        Sms.findOneAndUpdate(query, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. If I use reject try/catch is unecessary  
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to update SMS in MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save SMS to MongoDB
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}


module.exports = { saveSMS, updateSMS, updateSomeOfSMS }