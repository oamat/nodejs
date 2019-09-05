/*
 * mongodb util for notify platform. 
 *
 */

"use strict";

//Dependencies
const { Pns } = require('../models/pns');

//this method save PNS in MongoDB and manage the result of this operation
const savePNS = async (pns) => {
    return new Promise((resolve, reject) => {
        pns.save((error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if mongoose give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to save PNS to MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save PNS to MongoDB                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        .then((result) => { return result; })  //return the result
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}



//this method update PNS Status in MongoDB and manage the result of this operation
const updatePNS = async (pns) => {
    return new Promise((resolve, reject) => {
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        let query = { _id: pns._id };
        Pns.findOneAndUpdate(query, pns, options, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) console.log(error.message);
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to update PNS in MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save PNS to MongoDB
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        .then((result) => { return result; })  //return the result
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

//this method update PNS personalized params in MongoDB and manage the result of this operation
const updateSomeOfPNS = async (id, toUpdate) => {
    return new Promise((resolve, reject) => {
        let options = { new: true };
        let query = { _id: id };
        Pns.findOneAndUpdate(query, { $set: toUpdate }, options, (error, result) => {  //property new returns the new updated document, not the original document
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) console.log(error.message);
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we have a problem when try to update PNS in MongoDB. it\'s necessary check the problem before proceding.'); //If we cannot save PNS to MongoDB
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        })
    })
        .then((result) => { return result; })  //return the result
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { savePNS, updatePNS, updateSomeOfPNS }