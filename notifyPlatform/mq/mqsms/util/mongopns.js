/*
 * mongodb util for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 *
 */

"use strict";

//Dependencies
const { Pns } = require('../models/pns');

//this method finds All PNS's request with the condition in PNS MongoDB and manage the result of this operation
const findAllPNS = async (condition) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        Pns.find(condition, (error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else resolve(result); // everything is OK, return result                                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method save PNS in MongoDB and manage the result of this operation
const savePNS = async (pns) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        pns.save((error, result) => {
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("we have a problem when try to save PNS to MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB                 
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update PNS Status in MongoDB and manage the result of this operation
const updatePNS = async (pns) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        let query = { _id: pns._id };
        Pns.findOneAndUpdate(query, pns, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This PNS id doesn't exist, we cannot update PNS in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update PNS personalized params in MongoDB and manage the result of this operation
const updateSomePNS = async (id, toUpdate) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let options = { new: true };
        let query = { _id: id };
        Pns.findOneAndUpdate(query, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            if (error) reject(error);  //if mongoose give me an error. If we used reject the try/catch would be unnecessary  
            else if (result) resolve(result); // everything is OK, return result
            else reject(new Error("This PNS id doesn't exist, we cannot update PNS in MongoDB. it's necessary check the problem before proceding.")); //If we cannot save PNS to MongoDB
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { savePNS, updatePNS, updateSomePNS, findAllPNS }