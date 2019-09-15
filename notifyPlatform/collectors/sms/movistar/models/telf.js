/*
 * model Telf
 *
 */

"use strict";

//Dependencies
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

//IMPORTANT: by default Model Validations are check when save in Mongodb, not in the creation. 
// but you can check with validate() method
const telfSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => { return uuidv4(); }
    },
    telf: { // the unique user telf 
        type: String,
        required: true,
        unique: true
    },
    operator: {
        type: String, //MOV, ORA, VOD, VIP,...
        required: true
    },    
}, {
    timestamps: true //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

const Telf = mongoose.model('Telf', telfSchema);

module.exports = { Telf, telfSchema };