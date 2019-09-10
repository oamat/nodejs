/*
 * API REST for status and manage SMS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const auth = require('../auth/auth');


const { findSMS } = require('../util/mongomultisms');
const { dateFormat, logTime, descStatus } = require('../util/formats');


const router = new express.Router();

// GET /smsStatus   # uuid in body or telf and dates in body, and contract or all
router.get('/smsStatus', auth, async (req, res) => {
    try {
        if (!req.body._id) requestError(new Error("Param _id doesn't exist in the smsStatus request body."), req, res);
        else {
            let condition = { _id: req.body._id };
            var sms = await findSMS(condition);
            if (sms) {                          
                if (sms.dispatchedAt) res.send({ Status: "200 OK", _id: sms._id, status: sms.status, description: descStatus("SMS", sms.status), receivedAt: dateFormat(sms.receivedAt), dispatchedAt: dateFormat(sms.dispatchedAt) });
                else res.send({ Status: "200 OK", _id: sms._id, status: sms.status, description: descStatus("SMS", sms.status), receivedAt: dateFormat(sms.receivedAt) });
            } else {
                 res.send({ Status: "200 OK", _id: req.body._id, status: "-1", description: "SMS not found" });
            }
        }
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        requestError(error, req, res);
        //TODO: save error in db  or mem.
        //console.log(error);
    }
});


const requestError = async (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router