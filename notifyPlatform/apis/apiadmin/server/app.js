/*
 * API Server, between index and routers... 
 *
 */

"use strict";

//Dependencies
const express = require('express');


//Routers Dependencies
const contractRouter = require('../routers/contract');
const smsRouter = require('../routers/sms');
const pnsRouter = require('../routers/pns');
const collectorRouter = require('../routers/collector');

//Starting SERVER
const app = express(); // Init Express web framework 
app.use(express.json()); //load express config 

app.use(contractRouter); //load express routers
app.use(smsRouter); //load express routers
app.use(pnsRouter); //load express routers
app.use(collectorRouter); //load express routers

module.exports = app