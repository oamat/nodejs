/*
 * model Contract
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
const contractSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => { return uuidv4(); }
    },
    name: { // the unique id
        type: String,
        required: true,
        unique : true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length > 160) throw new Error('Description is invalid, it must be less than 160 characters.');
        }
    },
    permision: { // ME, WITHIN_APP, ALL
        type: String,
        required: true
    },
    application: {  // Within this application a contract with permission "WITHIN_APP" can see the info of all contracts. 
        type: String,
        required: true,
        trim: true
    },
    jwt: { //Secure JWT for authentication
        type: String,
        required: true
    },
    type: { //PNS, SMS, ..
        type: String,
        required: true,
        trim: true
    },
    interface: { // REST, BATCH, MQ, ALL.
        type: String,
        required: true
    },
    operator: { // some contracts can send only for one operator. 
        type: Boolean,
        required: true,
        default: 'ALL'
    },
    defaultOperator: { // just in case contract enters enters into operator contingency. 
        type: Boolean,
        required: true,
        default: 'ALL'
    },
    activated: {
        type: Boolean,
        required: true,
        default: true
    },
    params: [{  // new params... 
        _id: false,
        param: {
            type: String,
            required: false
        },
        value: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: false
        }
    }]
}, {
        timestamps: true //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    }, {
        versionKey: false // You should be aware of the outcome after set to false
    });

const Contract = mongoose.model('Contract', contractSchema);

module.exports = { Contract, contractSchema };