/*
 * mongodb Multi PNS for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 */

"use strict";

//Dependencies
const { Pns, ContractPns, CollectorPns, TokenPns } = require('../config/mongoosemulti'); // Attention : this Pns Model is model created for multi DB

//this method finds one PNS request with the condition in PNS MongoDB and manage the result of this operation
const findPNS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Pns().findOne(condition, (error, result) => {  //If we don't need any logic code we don't need try/catch inside callback            
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result   
        });
    });
    ////.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    ////.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All PNS request with the condition in PNS MongoDB and manage the result of this operation
const findAllPNS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Pns().find(condition, (error, result) => { //If we don't need any logic code we don't need try/catch inside callback              
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result              
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one PNS Contract with the condition in PNS MongoDB and manage the result of this operation
const findContractPns = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        ContractPns().findOne(condition, (error, result) => { //If we don't need any logic code we don't need try/catch inside callback            
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result      
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All PNS Contract's with the condition in PNS MongoDB and manage the result of this operation
const findAllContractPns = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        ContractPns().find(condition, (error, result) => { //If we don't need any logic code we don't need try/catch inside callback            
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result     
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save PNS Contract in MongoDB and manage the result of this operation
const saveContractPns = async (contract) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        contract.save((error, result) => { //If we don't need any logic code we don't need try/catch inside callback        
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save PNS Contract to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB       
        })
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update Contract SMS  personalized params in MongoDB and manage the result of this operation
const updateContractPns = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        ContractPns().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Contract name doesn't exist, we cannot update PNS Contract in MongoDB.")); //If we cannot save SMS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one PNS Collector with the condition in PNS MongoDB and manage the result of this operation
const findCollectorPns = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        CollectorPns().findOne(condition, (error, result) => { //If we don't need any logic code we don't need try/catch inside callback             
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All PNS Collector's with the condition in PNS MongoDB and manage the result of this operation
const findAllCollectorPns = async (condition) => { //If we don't need any logic code we don't need try/catch inside callback  
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        CollectorPns().find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result  
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save PNS Collector  in MongoDB and manage the result of this operation
const saveCollectorPns = async (collector) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        collector.save((error, result) => { //If we don't need any logic code we don't need try/catch inside callback 
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save PNS Collector to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update PNS Collector personalized params in MongoDB and manage the result of this operation
const updateCollectorPns = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        CollectorPns().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Collector name doesn't exist, we cannot update PNS Collector in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds one  PNS Token with the condition in PNS MongoDB and manage the result of this operation
const findTokenPns = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        TokenPns().findOne(condition, (error, result) => { //return a document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method finds All PNS Token's with the condition in PNS MongoDB and manage the result of this operation
//EXAMPLE with skip&limit for pagination: MyModel.find(query, fields, { skip: 10, limit: 5 }, function(err, results) { ... });
const findAllTokenPns = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        TokenPns().find(condition, (error, result) => { //return an Array
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save PNS Token in MongoDB and manage the result of this operation
const saveTokenPns = async (Token) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Token.save((error, result) => { //If we don't need any logic code we don't need try/catch inside callback  
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save PNS Token to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update PNS Token personalized params in MongoDB and manage the result of this operation
const updateTokenPns = async (condition, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        TokenPns().findOneAndUpdate(condition, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This Token doesn't exist, we cannot update PNS Token in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = {
    findPNS, findAllPNS, findContractPns, findAllContractPns, saveContractPns, updateContractPns, findCollectorPns,
    findAllCollectorPns, saveCollectorPns, updateCollectorPns, findTokenPns, findAllTokenPns, saveTokenPns, updateTokenPns
}