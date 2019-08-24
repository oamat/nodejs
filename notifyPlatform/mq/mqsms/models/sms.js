/*
 * model SMS
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
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
        required: true,
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
        trim: true,
        validate(value) {
            if (value.length > 160) throw new Error('message is invalid, it must be less than 160 characters.');
        }
    },
    priority: {
        type: Number,
        required: true,
        default: 3,  //0 VIP, 1 online, 2 MQ alta, 3 MQ normal, 4 MQ baja-batch alta, 5 batch baja
        validate(value) {
            if (value < 2) return 2;  // MQ priority needs to be >1. 0,1 are reserve for API online 
            else if (value > 5) return 5;  // MQ priority needs to be <66
        }
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
    },
    status: {
        type: Number,
        required: true,
        default: 0  //0:notSent, 1:Sent, 2:confirmed 3:Error
    },
    operator: {
        type: String, //MOV, ORA, VOD, NOS,...
        required: true
    },
    channel: {
        type: String, //SMS.MOV.1, [MOV, ORA, VOD, NOS] [0,1,2,3]
        required: true
    }
}, {
        timestamps: true //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    });

const Sms = mongoose.model('Sms', smsSchema);

module.exports = Sms;