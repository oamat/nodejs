/*
 * API Server, between index and routers... 
 *
 */

//require('./config/mongoose')
"use strict";

//Dependencies
const express = require('express');


//Routers Dependencies
const pnsRouter = require('../routers/pns');

//Starting SERVER
const app = express(); // Init Express web framework 
app.use(express.json()); //load express config 
app.use(pnsRouter); //load express routers

module.exports = app