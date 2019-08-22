/*
 * API REST for status and manage PNS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const Pns = require('../models/pns');
const auth = require('../auth/auth');

const { savePNS } = require('../util/mongodb');
const { hget, lpush, sadd, set } = require('../util/redis');
const { dateFormat, buildChannel } = require('../util/formats');


const router = new express.Router();

// GET /pnstatus   # uuid in body or telf and dates in body, and contract or all
router.get('/pnsStatus', auth, async (req, res) => {
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



// GET /pnsPending  # contract in body
router.get('/pnsPending', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's in redis and return them
    //TODO return list with SMS's
    res.send({ Status: "200 OK" });
});


module.exports = router