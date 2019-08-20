/*
 * API SMS
 *
 */

"use strict";

const express = require('express');
const Sms = require('../models/sms');
const auth = require('../auth/auth');
const redis = require('../config/redis');
const { dateFormat } = require('../util/formats');

const router = new express.Router();

   
// GET /smsStatus   # uuid in body
router.get('/smsStatus', auth, async (req, res) => {
    try { 
    console.log(req.body);
    //TODO find sms by id
    //TODO return Status
    res.send({ Status: "200 OK" });
} catch (error) {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));        
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
});

// GET /smsByTelf  # telf, dates in body
router.get('/smsByTelf', auth, async (req, res) => {
    console.log(req.body);
    //TODO find sms's by telf and between dates
    //TODO return SMS's Status
    res.send({ Status: "200 OK" });
});

// GET /smsByContract  # contract, dates in body
router.get('/smsByContract', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's by contract and between dates
    //TODO return list with SMS's Status
    res.send({ Status: "200 OK" });
});

// GET /smsInMem  # contract in body
router.get('/smsPending', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's in redis and return them
    //TODO return list with SMS's
    res.send({ Status: "200 OK" });
});




module.exports = router