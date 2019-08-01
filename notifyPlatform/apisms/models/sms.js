/*
 * model SMS
 *
 */

"use strict";

var mongoose = require('mongoose');

var Sms = mongoose.model('Sms', {
    uuid: {
        type: String,
        required: true,
        //minlength: 7,
        trim: true
    },
    joinedAt: {
        type: Date,
        default: null
    },
    dispatched: {
        type: Boolean,
        default: false
    },
    dispatchedAt: {
        type: Date,
        default: null
    },
    contract:{
        type: String,
        required: true,
        trim: true       
    },
    telf:{
        type: String,
        required: true,
        trim: true
    },
    text:{
        type: String,
        required: true,
        trim: true
    },
    retries:{
        type: Number,
        required: false,
        default: 0
    },
});

module.exports = { Sms };