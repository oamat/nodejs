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


//addContract

//getContract

//updateContract (activated, operator, etc)

//contingencyAllContracts (all with one operator to other or turnback to defaultOperator)

//changeCollector cron: Interval, status, operator



module.exports = router