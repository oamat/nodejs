/*
 * API Server, between index and routers... 
 *
 */

//require('./config/mongoose')
"use strict";

//Dependencies
const express = require('express');
const mongoose = require('../config/mongoose'); //we need to initialize mongoose
const redis = require('../config/redis'); //we need to initialize redis

//Routers Dependencies
const smsRouter = require('../routers/sms'); 

// Init Express web framework 
const app = express();

//load config & routers
app.use(express.json());
app.use(smsRouter);

module.exports = app