/*
 * API REST for status and manage SMS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const auth = require('../auth/auth');


const { findSMS } = require('../util/mongomultisms');
const { dateFormat } = require('../util/formats');


const router = new express.Router();

// GET /smsStatus   # uuid in body or telf and dates in body, and contract or all
router.get('/smsStatus', auth, async (req, res) => {
    try {
        let condition = {};
        var result = await findSMS(condition);
        console.log(result);
        //TODO find sms by id
        //TODO return Status
        res.send({ Status: "200 OK" });
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
        console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
        res.status(400).send(errorJson);
        //TODO: save error in db  or mem.
        console.log(error);
    }
});


// GET /smsInMem  # contract in body
router.get('/smsPending', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's in redis and return them
    //TODO return list with SMS's
    res.send({ Status: "200 OK" });
});


module.exports = router