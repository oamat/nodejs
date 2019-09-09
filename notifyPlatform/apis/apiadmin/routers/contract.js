/*
 * API REST for manage contracts
 *
 */

"use strict";

const express = require('express');
const auth = require('../auth/auth');
const redis = require('../config/redisconf');
const { logTime } = require('../util/formats');

const router = new express.Router();


// POST //addContract 
router.get('/addContract', auth, async (req, res) => {
    try {
        //addContract 
    } catch (error) {
        requestError(error, req, res);
    }
});

// GET ////getContract  
router.get('/getContract', auth, async (req, res) => {
    try {
        //getContract
    } catch (error) {
        requestError(error, req, res);
    }
});

// PATCH //updateContract (activated, operator, etc)  
router.patch('/updateContract', auth, async (req, res) => {
    try {
        //updateContract (activated, operator, etc)
    } catch (error) {
        requestError(error, req, res);
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