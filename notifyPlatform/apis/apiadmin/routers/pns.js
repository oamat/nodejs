/*
 * API REST for status and manage PNS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const auth = require('../auth/auth');

const { findPNS } = require('../util/mongomultipns');
const { dateFormat, logTime } = require('../util/formats');


const router = new express.Router();

// GET /pnstatus   # uuid in body or telf and dates in body, and contract or all
router.get('/pnsStatus', auth, async (req, res) => {
    try { 
        if (!req.body._id) requestError(new Error("Param _id doesn't exist in the smsStatus request body."), req, res);
        else {
            let condition = { _id: req.body._id };
            var pns = await findPNS(condition);
            if (pns) {                
                if (pns.dispatchedAt) res.send({ Status: "200 OK", _id: pns._id, status: pns.status, description: descStatus("PNS", pns.status), receivedAt: dateFormat(pns.receivedAt), dispatchedAt: dateFormat(pns.dispatchedAt) });
                else res.send({ Status: "200 OK", _id: pns._id, status: pns.status, description: descStatus("PNS", pns.status), receivedAt: dateFormat(pns.receivedAt) });
            } else {
                 res.send({ Status: "200 OK", _id: req.body._id, status: "-1", description: "PNS not found" });
            }
        }
} catch (error) {
    //TODO personalize errors 400 or 500. 
    requestError(error, req, res);
    //TODO: save error in db  or mem.
}
});



// GET /pnsPending  # contract in body
router.get('/pnsPending', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's in redis and return them
    //TODO return list with PNS's
    res.send({ Status: "200 OK" });
});


const requestError = async (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}

module.exports = router