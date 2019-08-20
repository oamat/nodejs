/*
 * API Server
 *
 */

//require('./config/mongoose')
"use strict";
const express = require('express');
const mongoose = require('../config/mongoose');
const redis = require('../config/redis');

const smsRouter = require('../routers/sms');

const app = express();

app.use(express.json());
app.use(smsRouter);

module.exports = app