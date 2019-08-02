/*
 * API Server
 *
 */

//require('./config/mongoose')
"use strict";
const express = require('express');
require('../config/mongoose')
const smsRouter = require('../routers/sms');

const app = express();

app.use(express.json());
app.use(smsRouter);

module.exports = app