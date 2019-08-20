/*
 * model SMS
 *
 */

"use strict";
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: Model Validations are check when save in Mongodb, not in the creation. 
const smsSchema = new mongoose.Schema({   
    _id: {
        type: String,
        required: true, 
        default: () => { return uuidv4(); }        
    },
    receivedAt: {  //we use createdAt of Mongoose.
        type: Date,
        required: true,
        default: () => { return new Date() }
    },
    dispatched: {
        type: Boolean,
        default: false
    },
    dispatchedAt: {
        type: Date,
        required: false
    },
    contract: {
        type: String,
        required: true,
        trim: true
    },
    telf: {
        type: String,
        required: true,
        trim: true
    },
    alias: {
        type: String,        
        required: false,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: Number,
        required: true,
        default: 1
    },
    interface: {
        type: String,
        required: true,
        trim: true,
        default: 'REST'
    },
    retries: {
        type: Number,
        required: true,
        default: 0
    },
    deferred: {
        type: Boolean,
        required: true,
        default: false
    },
    deferredAt: {
        type: Date,        
        required: false
    }
}, {
        timestamps: true  //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    });

const Sms = mongoose.model('Sms', smsSchema);

module.exports = Sms;