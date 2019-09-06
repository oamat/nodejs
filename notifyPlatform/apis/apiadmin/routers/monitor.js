/*
 * API REST for manage contracts
 *
 */

"use strict";

const express = require('express');
const auth = require('../auth/auth');
const redisconf = require('../util/redisconf');
const { dateFormat, logTime } = require('../util/formats');

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
        redisconf.hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.7UhLsjPpOwneXzN3nlT35OJjduzp70Yni9l1HO9wCck");

        //APIPNS
        redisconf.hset("contractpns:PUSHLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJQVVNITE9XRUIiLCJpYXQiOjIwMTYyMzkwMjJ9.2HM9zm5cqGF0KBEqlYamatnZzi4vMUTdhHhhH4S2ySo");
        redisconf.hset("contractpns:PUSHLOWEB", "operator", "ALL");


        //APISMS
        redisconf.hset("contract:OTPLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.RSLawzTU4yX-XwnEZtvWipIBOTOji9LKbkuM391zjss");
        redisconf.hset("contract:OTPLOWEB", "operator", "MOV");

        //batchSMS
        redisconf.hset("batch:SMS", "status", "1");
        redisconf.hset("batch:SMS", "interval", "2000");
        redisconf.hset("batch:SMS", "intervalControl", "30000");

        //batchPNSs
        redisconf.hset("batch:PNS", "status", "1");
        redisconf.hset("batch:PNS", "interval", "2000");
        redisconf.hset("batch:PNS", "intervalControl", "30000");

        //Collectors Apple
        redisconf.hset("collectorpns:APP", "status", "1");
        redisconf.hset("collectorpns:APP", "interval", "2000");
        redisconf.hset("collectorpns:APP", "intervalControl", "30000");
        redisconf.hset("collectorpns:APP", "operator", "APP");

        //Collectors Android
        redisconf.hset("collectorpns:GOO", "status", "1");
        redisconf.hset("collectorpns:GOO", "interval", "2000");
        redisconf.hset("collectorpns:GOO", "intervalControl", "30000");
        redisconf.hset("collectorpns:GOO", "operator", "GOO");

        //Collectors Microsoft
        redisconf.hset("collectorpns:MIC", "status", "1");
        redisconf.hset("collectorpns:MIC", "interval", "2000");
        redisconf.hset("collectorpns:MIC", "intervalControl", "30000");
        redisconf.hset("collectorpns:MIC", "operator", "MIC");

        //Collectors Movistar
        redisconf.hset("collector:MOV", "status", "1");
        redisconf.hset("collector:MOV", "interval", "2000");
        redisconf.hset("collector:MOV", "intervalControl", "30000");
        redisconf.hset("collector:MOV", "operator", "MOV");

        //Collectors MovistarVIP
        redisconf.hset("collector:VIP", "status", "1");
        redisconf.hset("collector:VIP", "interval", "2000");
        redisconf.hset("collector:VIP", "intervalControl", "30000");
        redisconf.hset("collector:VIP", "operator", "VIP");

        //Collectors ORANGE
        redisconf.hset("collector:ORA", "status", "1");
        redisconf.hset("collector:ORA", "interval", "2000");
        redisconf.hset("collector:ORA", "intervalControl", "30000");
        redisconf.hset("collector:ORA", "operator", "ORA");

        //Collectors VODAFONE
        redisconf.hset("collector:VOD", "status", "1");
        redisconf.hset("collector:VOD", "interval", "2000");
        redisconf.hset("collector:VOD", "intervalControl", "30000");
        redisconf.hset("collector:VOD", "operator", "VOD");


        res.send({ Status: "200 OK" });
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
        res.status(400).send(errorJson);
        //TODO: save error in db  or mem.
    }
});

module.exports = router