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
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length > 160) throw new Error('Description is invalid, it must be less than 160 characters.');
        }
    },
    permission: { //"THIS":only this contract, "WITHIN_APP": contracts with the same application, "ALL": All contracts. ( ADMIN CONTRACT ALLWAYS CAN SEE ALL )
        type: String,
        required: true,
        validate(value) {
            if (value != "THIS" && value != "WITHIN_APP" && value != "ALL") throw new Error("Permission is invalid, it must be one of this options: 'THIS':only this contract, 'WITHIN_APP': contracts with the same application, 'ALL': All contracts.");
        }
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
        trim: true,
        validate(value) {
            if (value != "PNS" && value != "SMS") throw new Error("Type is invalid, it must be one of this options: 'PNS' or 'SMS'.");
        }
    },
    interface: { // REST, BATCH, MQ, ALL.
        type: String,
        required: true,
        validate(value) {
            if (value != "REST" && value != "BATCH" && value != "MQ" && value != "ALL") throw new Error("Interface is invalid, it must be one of this options: 'REST', 'BATCH', 'MQ' or 'ALL'.");
        }
    },
    operator: { // some contracts can send only for one operator. 
        type: String,
        required: true,
        default: 'ALL',
        validate(value) {
            if (this.type = "SMS") {
                if (value != "MOV" && value != "ORA" && value != "VIP" && value != "VOD" && value != "ALL") throw new Error("Operator is invalid, it must be one of this options: 'MOV', 'VIP', 'ORA', 'VOD' or 'ALL'.");
            } else { //PNS
                if (value != "APP" && value != "GOO" && value != "MIC" && value != "ALL") throw new Error("Operator is invalid, it must be one of this options: 'APP', 'GOO', 'MIC', or 'ALL'.");
            }
        }
    },
    defaultOperator: { // just in case contract enters into operator contingency. 
        type: String,
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