/*
 * mongodb util for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 *
 */

"use strict";

//Dependencies
const { Sms } = require('../models/sms');

//this method finds All SMS's request with the condition in SMS MongoDB and manage the result of this operation
const findAllSMS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Sms.find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save SMS in MongoDB and manage the result of this operation
const saveSMS = async (sms) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        sms.save((error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save SMS to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update SMS Status in MongoDB and manage the result of this operation
const updateSMS = async (sms) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        let query = { _id: sms._id };
        Sms.findOneAndUpdate(query, sms, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to update SMS in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update SMS personalized params in MongoDB and manage the result of this operation
const updateSomeSMS = async (id, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        let query = { _id: id };
        Sms.findOneAndUpdate(query, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to update SMS in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { saveSMS, updateSMS, updateSomeSMS, findAllSMS }