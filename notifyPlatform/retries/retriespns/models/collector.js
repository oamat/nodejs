/*
 * model Collector
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
const collectorSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => { return uuidv4(); }
    },
    name: { // the unique name for collector (the operator name by default)
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
    type: { //PNS, SMS, ..
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value != "PNS" && value != "SMS") throw new Error("Type is invalid, it must be one of this options: 'PNS' or 'SMS'.");
        }
    },
    operator: { //if operator was'nt the same of "name", we are in contingency 
        type: String,
        required: true
    },
    status: { //the status of collector. 
        type: Boolean,
        required: true,
        default: true
    },
    activated: {
        type: Boolean,
        required: true,
        default: true
    },
    interval: { //rate of main cron in ms
        type: Number,
        required: true,
        default: 10
    },
    intervalControl: { //rate of Control cron in ms
        type: Number,
        required: true,
        default: 30000
    },
    remitter:{ //the default remiter for SMS
        type: String,
        required: false        
    }
}, {
    timestamps: true //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

const Collector = mongoose.model('Collector', collectorSchema);

module.exports = { Collector, collectorSchema };