/*
 * API REST for manage contracts
 *
 */

"use strict";

const express = require('express');
const Sms = require('../models/sms');
const auth = require('../auth/auth');
const redis = require('../config/redis');
const { dateFormat } = require('../util/formats');

const router = new express.Router();


//CollectorStatus

//APIStatus

//RedisStatus

//contingencyStatus

//ErrorsPending



module.exports = router