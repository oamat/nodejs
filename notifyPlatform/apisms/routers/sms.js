/*
 * API SMS
 *
 */

"use strict";

const express = require('express');
const sms= require('../models/sms');
const auth = require('../auth/auth');
const router = new express.Router();

router.post('/smsSend', auth, async (req, res) => {
    console.log( req.body );
    //TODO generate ID and put in JSON
    //TODO put message in Redis
    //TODO save body to DB (with ID, CONTRACT, telf)
    
    res.send("OK");
});

// GET /smsStatus   # uuid in body
router.get('/smsStatus', auth, async (req, res) => {
    console.log( req.body );
    //TODO find sms by id
    //TODO return Status
    res.send("OK");
});

// GET /smsByTelf  # telf, dates in body
router.get('/smsByTelf', auth, async (req, res) => {
    console.log( req.body );
    //TODO find sms's by telf and between dates
    //TODO return SMS's Status
    res.send("OK");
});

// GET /smsByContract  # contract, dates in body
router.get('/smsByContract', auth, async (req, res) => {
    console.log( req.body );
    
    //TODO find sms's by contract and between dates
    //TODO return list with SMS's Status
    res.send("OK");
});

// GET /smsInMem  # contract in body
router.get('/smsInMem', auth, async (req, res) => {
    console.log( req.body );
    
    //TODO find sms's in redis and return them
    //TODO return list with SMS's
    res.send("OK");
});




module.exports = router