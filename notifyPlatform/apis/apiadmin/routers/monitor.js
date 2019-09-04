/*
 * API REST for manage contracts
 *
 */

"use strict";

const express = require('express');
const auth = require('../auth/auth');
const redissms = require('../util/redissms');
const redispns = require('../util/redispns');
const { dateFormat } = require('../util/formats');

const router = new express.Router();


//CollectorStatus

//APIStatus

//RedisStatus

//contingencyStatus

//ErrorsPending


// GET /smsStatus   # uuid in body or telf and dates in body, and contract or all
router.get('/loadRedis', async (req, res) => {
    try {

        //APIADMIN
        redissms.hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.7UhLsjPpOwneXzN3nlT35OJjduzp70Yni9l1HO9wCck");

        //APIPNS
        redispns.hset("contractpns:PUSHLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJQVVNITE9XRUIiLCJpYXQiOjIwMTYyMzkwMjJ9.2HM9zm5cqGF0KBEqlYamatnZzi4vMUTdhHhhH4S2ySo");
        redispns.hset("contractpns:PUSHLOWEB", "operator", "ALL");


        //APISMS
        redissms.hset("contract:OTPLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.RSLawzTU4yX-XwnEZtvWipIBOTOji9LKbkuM391zjss");
        redissms.hset("contract:OTPLOWEB", "operator", "MOV");

        //batchSMS
        redissms.hset("batch:SMS", "status", "1");
        redissms.hset("batch:SMS", "interval", "2000");
        redissms.hset("batch:SMS", "intervalControl", "30000");

        //batchPNSs
        redispns.hset("batch:PNS", "status", "1");
        redispns.hset("batch:PNS", "interval", "2000");
        redispns.hset("batch:PNS", "intervalControl", "30000");

        //Collectors Apple
        redispns.hset("collectorpns:APP", "status", "1");
        redispns.hset("collectorpns:APP", "interval", "2000");
        redispns.hset("collectorpns:APP", "intervalControl", "30000");
        redispns.hset("collectorpns:APP", "operator", "APP");

        //Collectors Android
        redispns.hset("collectorpns:AND", "status", "1");
        redispns.hset("collectorpns:AND", "interval", "2000");
        redispns.hset("collectorpns:AND", "intervalControl", "30000");
        redispns.hset("collectorpns:AND", "operator", "AND");

        //Collectors Microsoft
        redispns.hset("collectorpns:MIC", "status", "1");
        redispns.hset("collectorpns:MIC", "interval", "2000");
        redispns.hset("collectorpns:MIC", "intervalControl", "30000");
        redispns.hset("collectorpns:MIC", "operator", "MIC");

        //Collectors Movistar
        redissms.hset("collector:MOV", "status", "1");
        redissms.hset("collector:MOV", "interval", "2000");
        redissms.hset("collector:MOV", "intervalControl", "30000");
        redissms.hset("collector:MOV", "operator", "MOV");

        //Collectors MovistarVIP
        redissms.hset("collector:VIP", "status", "1");
        redissms.hset("collector:VIP", "interval", "2000");
        redissms.hset("collector:VIP", "intervalControl", "30000");
        redissms.hset("collector:VIP", "operator", "VIP");

        //Collectors ORANGE
        redissms.hset("collector:ORA", "status", "1");
        redissms.hset("collector:ORA", "interval", "2000");
        redissms.hset("collector:ORA", "intervalControl", "30000");
        redissms.hset("collector:ORA", "operator", "ORA");

        //Collectors VODAFONE
        redissms.hset("collector:VOD", "status", "1");
        redissms.hset("collector:VOD", "interval", "2000");
        redissms.hset("collector:VOD", "intervalControl", "30000");
        redissms.hset("collector:VOD", "operator", "VOD");


        res.send({ Status: "200 OK" });
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
        console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
        res.status(400).send(errorJson);
        //TODO: save error in db  or mem.
    }
});

module.exports = router