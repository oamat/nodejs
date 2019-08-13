/*
 * API Server, between index and routers... 
 *
 */

//require('./config/mongoose')
"use strict";

//Dependencies
const express = require('express');
const { initializeMongooseConection } = require('../config/mongoose'); //we need to initialize mongoose
require('../config/redis'); //we need to initialize redis

//Routers Dependencies
const smsRouter = require('../routers/sms');

const initializeMongoose = async () => { // Init Mongoose with await    
    await initializeMongooseConection();
}

//Starting SERVER 

initializeMongoose(); //Init Mongoose
const app = express(); // Init Express web framework 
app.use(express.json()); //load express config 
app.use(smsRouter); //load express routers

module.exports = app