/*
 * model PNS
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
const pnsSchema = new mongoose.Schema({
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
    application: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: String,
        required: true,
        trim: true
    },
    uuiddevice: {
        type: String,
        required: true,
        trim: true
    },
    badge: {
        type: String,
        required: false,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length > 160) throw new Error('message is invalid, it must be less than 160 characters.');
        }
    },
    action: {
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
        default: 1,  //0 VIP, 1 online, 2 MQ alta, 3 MQ normal, 4 MQ baja-batch alta, 5 batch baja
        validate(value) {
            if (value < 0) return 0;
            else if (value > 5) return 5;
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
        type: String, //GOO, APP, MIC...
        required: true
    },
    channel: {
        type: String, //PNS.GOO.1, [GOO, APP, MIC] [0,1,2,3]
        required: true
    },
    jwt: {  // we need jwt for MQ, but we don't need to save in mongodb.
        type: String,
        required: false,
        trim: true
    },
    customId: {
        type: String,
        required: false
    },
    params: [{
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

const Pns = mongoose.model('Pns', pnsSchema);

module.exports = { Pns, pnsSchema };