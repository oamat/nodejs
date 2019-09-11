/*
 * API REST for manage contracts
 *
 */

"use strict";


//Dependencies
const express = require('express');
const auth = require('../auth/auth');
const redisconf = require('../util/redisconf');
const redissms = require('../util/redissms');
const redispns = require('../util/redispns');
const { dateFormat, logTime, buildSMSChannels, buildPNSChannels } = require('../util/formats');

//VARS
const router = new express.Router();
const channelsMOV = buildSMSChannels("MOV");
const channelsVIP = buildSMSChannels("VIP");
const channelsORA = buildSMSChannels("ORA");
const channelsVOD = buildSMSChannels("VOD");
const channelsAPP = buildPNSChannels("APP");
const channelsGOO = buildPNSChannels("GOO");
const channelsMIC = buildPNSChannels("MIC");

// GET /pendingNotifications  # contract in body
router.get('/pendingNotifications', auth, async (req, res) => {
    try {
        // START 42 "tasks" in parallel. we put await because we need all results before construct the json   
        await Promise.all([
            redissms.llen(channelsMOV.channel0),
            redissms.llen(channelsMOV.channel1),
            redissms.llen(channelsMOV.channel2),
            redissms.llen(channelsMOV.channel3),
            redissms.llen(channelsMOV.channel4),
            redissms.llen(channelsMOV.channel5),
            redissms.llen(channelsVIP.channel0),
            redissms.llen(channelsVIP.channel1),
            redissms.llen(channelsVIP.channel2),
            redissms.llen(channelsVIP.channel3),
            redissms.llen(channelsVIP.channel4),
            redissms.llen(channelsVIP.channel5),
            redissms.llen(channelsVOD.channel0),
            redissms.llen(channelsVOD.channel1),
            redissms.llen(channelsVOD.channel2),
            redissms.llen(channelsVOD.channel3),
            redissms.llen(channelsVOD.channel4),
            redissms.llen(channelsVOD.channel5),
            redissms.llen(channelsORA.channel0),
            redissms.llen(channelsORA.channel1),
            redissms.llen(channelsORA.channel2),
            redissms.llen(channelsORA.channel3),
            redissms.llen(channelsORA.channel4),
            redissms.llen(channelsORA.channel5),
            redispns.llen(channelsAPP.channel0),
            redispns.llen(channelsAPP.channel1),
            redispns.llen(channelsAPP.channel2),
            redispns.llen(channelsAPP.channel3),
            redispns.llen(channelsAPP.channel4),
            redispns.llen(channelsAPP.channel5),
            redispns.llen(channelsGOO.channel0),
            redispns.llen(channelsGOO.channel1),
            redispns.llen(channelsGOO.channel2),
            redispns.llen(channelsGOO.channel3),
            redispns.llen(channelsGOO.channel4),
            redispns.llen(channelsGOO.channel5),
            redispns.llen(channelsMIC.channel0),
            redispns.llen(channelsMIC.channel1),
            redispns.llen(channelsMIC.channel2),
            redispns.llen(channelsMIC.channel3),
            redispns.llen(channelsMIC.channel4),
            redispns.llen(channelsMIC.channel5)

        ]).then(values => {
            let total = 0;
            for (var i = 0; i < 42; i++) { //42 iteration loop for calculate the total pending notifications
                total = total + values[i];
            }
            res.send({
                Status: "200 OK",
                total,
                "MOVISTAR": [{
                    [channelsMOV.channel0]: values[0],
                    [channelsMOV.channel1]: values[1],
                    [channelsMOV.channel2]: values[2],
                    [channelsMOV.channel3]: values[3],
                    [channelsMOV.channel4]: values[4],
                    [channelsMOV.channel5]: values[5]
                }],
                "MOVISTAR-VIP": [{
                    [channelsVIP.channel0]: values[6],
                    [channelsVIP.channel1]: values[7],
                    [channelsVIP.channel2]: values[8],
                    [channelsVIP.channel3]: values[9],
                    [channelsVIP.channel4]: values[10],
                    [channelsVIP.channel5]: values[11]
                }],
                "VODAFONE": [{
                    [channelsVOD.channel0]: values[12],
                    [channelsVOD.channel1]: values[13],
                    [channelsVOD.channel2]: values[14],
                    [channelsVOD.channel3]: values[15],
                    [channelsVOD.channel4]: values[16],
                    [channelsVOD.channel5]: values[17]
                }],
                "ORANGE": [{
                    [channelsORA.channel0]: values[18],
                    [channelsORA.channel1]: values[19],
                    [channelsORA.channel2]: values[20],
                    [channelsORA.channel3]: values[21],
                    [channelsORA.channel4]: values[22],
                    [channelsORA.channel5]: values[23]
                }],
                "APPLE": [{
                    [channelsAPP.channel0]: values[24],
                    [channelsAPP.channel1]: values[25],
                    [channelsAPP.channel2]: values[26],
                    [channelsAPP.channel3]: values[27],
                    [channelsAPP.channel4]: values[28],
                    [channelsAPP.channel5]: values[29]
                }],
                "GOOGLE": [{
                    [channelsGOO.channel0]: values[30],
                    [channelsGOO.channel1]: values[31],
                    [channelsGOO.channel2]: values[32],
                    [channelsGOO.channel3]: values[33],
                    [channelsGOO.channel4]: values[34],
                    [channelsGOO.channel5]: values[35]
                }],
                "MICROSOFT": [{
                    [channelsMIC.channel0]: values[36],
                    [channelsMIC.channel1]: values[37],
                    [channelsMIC.channel2]: values[38],
                    [channelsMIC.channel3]: values[39],
                    [channelsMIC.channel4]: values[40],
                    [channelsMIC.channel5]: values[41]
                }]
            });
        });
        // END 42 "tasks" in parallel. we put await because we need all results before construct the json   

    } catch (error) {
        requestError(error, req, res);
    }
});

// GET //serviceStatus  # contract in body
router.get('/serviceStatus', auth, async (req, res) => {
    try {
        // START 43 "tasks" in parallel. we put await because we need all results before construct the json   
        await Promise.all([
            redisconf.hgetOrNull("batch:SMS", "status"),
            redisconf.hgetOrNull("batch:SMS", "interval"),
            redisconf.hgetOrNull("batch:SMS", "intervalControl"),
            redisconf.hgetOrNull("batch:SMS", "last"),
            redisconf.hgetOrNull("batch:PNS", "status"),
            redisconf.hgetOrNull("batch:PNS", "interval"),
            redisconf.hgetOrNull("batch:PNS", "intervalControl"),
            redisconf.hgetOrNull("batch:PNS", "last"),
            //PNS CollectorStatus
            redisconf.hgetOrNull("collectorpns:APP", "status"),
            redisconf.hgetOrNull("collectorpns:APP", "interval"),
            redisconf.hgetOrNull("collectorpns:APP", "intervalControl"),
            redisconf.hgetOrNull("collectorpns:APP", "last"),
            redisconf.hgetOrNull("collectorpns:APP", "operator"),
            redisconf.hgetOrNull("collectorpns:GOO", "status"),
            redisconf.hgetOrNull("collectorpns:GOO", "interval"),
            redisconf.hgetOrNull("collectorpns:GOO", "intervalControl"),
            redisconf.hgetOrNull("collectorpns:GOO", "last"),
            redisconf.hgetOrNull("collectorpns:GOO", "operator"),
            redisconf.hgetOrNull("collectorpns:MIC", "status"),
            redisconf.hgetOrNull("collectorpns:MIC", "interval"),
            redisconf.hgetOrNull("collectorpns:MIC", "intervalControl"),
            redisconf.hgetOrNull("collectorpns:MIC", "last"),
            redisconf.hgetOrNull("collectorpns:MIC", "operator"),
            //SMS CollectorStatus
            redisconf.hgetOrNull("collectorsms:MOV", "status"),
            redisconf.hgetOrNull("collectorsms:MOV", "interval"),
            redisconf.hgetOrNull("collectorsms:MOV", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:MOV", "last"),
            redisconf.hgetOrNull("collectorsms:MOV", "operator"),
            redisconf.hgetOrNull("collectorsms:VIP", "status"),
            redisconf.hgetOrNull("collectorsms:VIP", "interval"),
            redisconf.hgetOrNull("collectorsms:VIP", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:VIP", "last"),
            redisconf.hgetOrNull("collectorsms:VIP", "operator"),
            redisconf.hgetOrNull("collectorsms:ORA", "status"),
            redisconf.hgetOrNull("collectorsms:ORA", "interval"),
            redisconf.hgetOrNull("collectorsms:ORA", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:ORA", "last"),
            redisconf.hgetOrNull("collectorsms:ORA", "operator"),
            redisconf.hgetOrNull("collectorsms:VOD", "status"),
            redisconf.hgetOrNull("collectorsms:VOD", "interval"),
            redisconf.hgetOrNull("collectorsms:VOD", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:VOD", "last"),
            redisconf.hgetOrNull("collectorsms:VOD", "operator")

        ]).then(values => {
            res.send({
                Status: "200 OK",
                description: "status[1:ON, 0:OFF] - interval[cron(ms)] - intervalControl[cronController(ms)] - lastExecutionCheckControl[last CronController execution] - operator[Contingency]",
                "SMS-Batch": [{
                    status: values[0],
                    interval: values[1],
                    intervalControl: values[2],
                    lastExecutionCheckControl: values[3]
                }],
                "PNS-Batch": [{
                    status: values[4],
                    interval: values[5],
                    intervalControl: values[6],
                    lastExecutionCheckControl: values[7]
                }],
                "APPLE-collector": [{
                    status: values[8],
                    interval: values[9],
                    intervalControl: values[10],
                    lastExecutionCheckControl: values[11],
                    operator: values[12]
                }],
                "GOOGLE-collector": [{
                    status: values[13],
                    interval: values[14],
                    intervalControl: values[15],
                    lastExecutionCheckControl: values[16],
                    operator: values[17]
                }],
                "MICROSOFT-collector": [{
                    status: values[18],
                    interval: values[19],
                    intervalControl: values[20],
                    lastExecutionCheckControl: values[21],
                    operator: values[22]
                }],
                "MOVISTAR-collector": [{
                    status: values[23],
                    interval: values[24],
                    intervalControl: values[25],
                    lastExecutionCheckControl: values[26],
                    operator: values[27]
                }],
                "VIP-MOVISTAR-collector": [{
                    status: values[28],
                    interval: values[29],
                    intervalControl: values[30],
                    lastExecutionCheckControl: values[31],
                    operator: values[32]
                }],
                "ORANGE-collector": [{
                    status: values[33],
                    interval: values[34],
                    intervalControl: values[35],
                    lastExecutionCheckControl: values[36],
                    operator: values[37]
                }],
                "VODAFONE-collector": [{
                    status: values[38],
                    interval: values[39],
                    intervalControl: values[40],
                    lastExecutionCheckControl: values[41],
                    operator: values[42]
                }]
            });
        });
        // END 43 "tasks" in parallel. we put await because we need all results before construct the json   
        // TODO : APIStatus?
        // TODO : RedisStatus
        // TODO : MongoDBStatus
    } catch (error) {
        requestError(error, req, res);
    }
});

// GET //serviceStatus  # contract in body
router.get('/contingencyActivate', auth, async (req, res) => {
    try {
        //ContingencyActivate
    } catch (error) {
        requestError(error, req, res);
    }
});

//contingencyAllContracts (all with one operator to other or turnback to defaultOperator)

//changeCollector cron: Interval, status, operator//contingencyAllContracts (all with one operator to other or turnback to defaultOperator)

//changeCollector cron: Interval, status, operator


// GET /smsStatus   # uuid in body or telf and dates in body, and contract or all
router.get('/loadRedis', auth, async (req, res) => {
    try {

        //redisconf.hmset([ "contracttst:ADMIN", "tst", "tst"]);

        //APIADMIN
        redisconf.hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg");
        //APIPNS
        redisconf.hset("contractpns:PUSHLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw");
        redisconf.hset("contractpns:PUSHLOWEB", "operator", "ALL");
        //APISMS
        redisconf.hset("contractsms:OTPLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4");
        redisconf.hset("contractsms:OTPLOWEB", "operator", "MOV");
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
        redisconf.hset("collectorsms:MOV", "status", "1");
        redisconf.hset("collectorsms:MOV", "interval", "2000");
        redisconf.hset("collectorsms:MOV", "intervalControl", "30000");
        redisconf.hset("collectorsms:MOV", "operator", "MOV");
        //Collectors MovistarVIP
        redisconf.hset("collectorsms:VIP", "status", "1");
        redisconf.hset("collectorsms:VIP", "interval", "2000");
        redisconf.hset("collectorsms:VIP", "intervalControl", "30000");
        redisconf.hset("collectorsms:VIP", "operator", "VIP");
        //Collectors ORANGE
        redisconf.hset("collectorsms:ORA", "status", "1");
        redisconf.hset("collectorsms:ORA", "interval", "2000");
        redisconf.hset("collectorsms:ORA", "intervalControl", "30000");
        redisconf.hset("collectorsms:ORA", "operator", "ORA");
        //Collectors VODAFONE
        redisconf.hset("collectorsms:VOD", "status", "1");
        redisconf.hset("collectorsms:VOD", "interval", "2000");
        redisconf.hset("collectorsms:VOD", "intervalControl", "30000");
        redisconf.hset("collectorsms:VOD", "operator", "VOD");
        res.send({ Status: "200 OK" });
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        requestError(error, req, res);
        //TODO: save error in db  or mem.
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