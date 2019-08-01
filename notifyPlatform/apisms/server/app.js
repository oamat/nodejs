/*
 * API Server
 *
 */

//require('./config/mongoose')
"use strict";
const express = require('express');
const smsRouter = require('../routers/sms');

const app = express();

app.use(express.json());
app.use(smsRouter);

module.exports = app