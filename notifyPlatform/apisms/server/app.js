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



const initializeMongoose = async () => {
    // Init Mongoose 
    await initializeMongooseConection();
}

initializeMongoose();
// Init Express web framework 
const app = express();
//load config & routers
app.use(express.json());
app.use(smsRouter);

module.exports = app