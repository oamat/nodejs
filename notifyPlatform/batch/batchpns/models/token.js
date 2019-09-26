/*
 * model Token
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
const tokenSchema = new mongoose.Schema({    
    _id: {
        type: String,
        required: true,
        default: () => { return uuidv4(); }
    },
    token: {  // we don't sure is a unique token?? by mobile user and APP
        type: String,
        required: true
    },
    operator: {  
        type: String,
        required: true
    },
    activated: {
        type: Boolean,
        required: true,
        default: true
    },
    contract: {
        type: String,
        required: true
    },
    application: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    uuiddevice: {
        type: String,
        required: true
    },
}, {
    timestamps: true //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
}, {
    versionKey: false // You should be aware of the outcome after set to false
}).index({ application: 1, uuiddevice: 1 }, { unique: true });

const Token = mongoose.model('Token', tokenSchema);

module.exports = { Token, tokenSchema };