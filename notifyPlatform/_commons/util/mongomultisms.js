/*
 * mongodb Multi SMS for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 *
 */

"use strict";

//Dependencies
const { Sms, ContractSms, CollectorSms, TelfSms } = require('../config/mongoosemulti');  // Attention : this Sms Model is model created for multi DB

//this method finds one SMS request with the condition in SMS MongoDB and manage the result of this operation
const findSMS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Sms().findOne(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All SMS's request with the condition in SMS MongoDB and manage the result of this operation
const findAllSMS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Sms().find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one SMS Contract with the condition in SMS MongoDB and manage the result of this operation
const findContractSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        ContractSms().findOne(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All SMS Contract's with the condition in SMS MongoDB and manage the result of this operation
const findAllContractSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        ContractSms().find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save SMS Contract in MongoDB and manage the result of this operation
const saveContractSms = async (contract) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        contract.save((error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save SMS Contract to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB                 
        })
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update Contract SMS  personalized params in MongoDB and manage the result of this operation
const updateContractSms = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        ContractSms().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Contract name doesn't exist, we cannot update SMS Contract in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one Collector SMS with the condition in SMS MongoDB and manage the result of this operation
const findCollectorSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        CollectorSms().findOne(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All Collector SMS's with the condition in SMS MongoDB and manage the result of this operation
const findAllCollectorSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        CollectorSms().find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save Collector SMS  in MongoDB and manage the result of this operation
const saveCollectorSms = async (collector) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        collector.save((error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save SMS Collector to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update Collector SMS  personalized params in MongoDB and manage the result of this operation
const updateCollectorSms = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        CollectorSms().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Collector name doesn't exist, we cannot update SMS Collector in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one Telf SMS with the condition in SMS MongoDB and manage the result of this operation
const findTelfSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        TelfSms().findOne(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All Telf SMS's with the condition in SMS MongoDB and manage the result of this operation
//EXAMPLE with skip&limit for pagination: MyModel.find(query, fields, { skip: 10, limit: 5 }, function(err, results) { ... });
const findAllTelfSms = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        TelfSms().find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save Telf SMS  in MongoDB and manage the result of this operation
const saveTelfSms = async (telf) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        telf.save((error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save SMS Telf to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update Telf SMS  personalized params in MongoDB and manage the result of this operation
const updateTelfSms = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        TelfSms().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Telephone doesn't exist, we cannot update SMS Telf in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = {
    findSMS, findAllSMS, findContractSms, findAllContractSms, saveContractSms, updateContractSms, findCollectorSms,
    findAllCollectorSms, saveCollectorSms, updateCollectorSms, findTelfSms, findAllTelfSms, saveTelfSms, updateTelfSms
} 
