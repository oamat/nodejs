/*
 * API REST for manage collectors
 *      /pendingNotifications : shows notifications not sent in redis list
 *      /serviceStatus : return the interval and status of collectors
 *      /operatorContingency : change operator in a collector
 *      /changeCollector : change conf like rate and status in collectors
 */

"use strict";


//Dependencies
const express = require('express');
const auth = require('../auth/auth');
const redisconf = require('../util/redisconf');
const redissms = require('../util/redissms');
const redispns = require('../util/redispns');
const { dateFormat, logTime, buildSMSChannels, buildPNSChannels, validateOperator } = require('../util/formats');
const { updateCollectorSms } = require('../util/mongomultisms');
const { updateCollectorPns } = require('../util/mongomultipns');
const { loadRedisConf } = require('../util/redisdataload');


//VARS
const router = new express.Router();
const channelsMOV = buildSMSChannels("MOV");
const channelsVIP = buildSMSChannels("VIP");
const channelsORA = buildSMSChannels("ORA");
const channelsVOD = buildSMSChannels("VOD");
const channelsAPP = buildPNSChannels("APP");
const channelsGOO = buildPNSChannels("GOO");
const channelsMIC = buildPNSChannels("MIC");

// GET /pendingNotifications   # contract in body for Auth
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
            let index=0;
            res.send({
                Status: "200 OK",
                total,
                "MOVISTAR": [{
                    [channelsMOV.channel0]: values[index++],
                    [channelsMOV.channel1]: values[index++],
                    [channelsMOV.channel2]: values[index++],
                    [channelsMOV.channel3]: values[index++],
                    [channelsMOV.channel4]: values[index++],
                    [channelsMOV.channel5]: values[index++]
                }],
                "MOVISTAR-VIP": [{
                    [channelsVIP.channel0]: values[index++],
                    [channelsVIP.channel1]: values[index++],
                    [channelsVIP.channel2]: values[index++],
                    [channelsVIP.channel3]: values[index++],
                    [channelsVIP.channel4]: values[index++],
                    [channelsVIP.channel5]: values[index++]
                }],
                "VODAFONE": [{
                    [channelsVOD.channel0]: values[index++],
                    [channelsVOD.channel1]: values[index++],
                    [channelsVOD.channel2]: values[index++],
                    [channelsVOD.channel3]: values[index++],
                    [channelsVOD.channel4]: values[index++],
                    [channelsVOD.channel5]: values[index++]
                }],
                "ORANGE": [{
                    [channelsORA.channel0]: values[index++],
                    [channelsORA.channel1]: values[index++],
                    [channelsORA.channel2]: values[index++],
                    [channelsORA.channel3]: values[index++],
                    [channelsORA.channel4]: values[index++],
                    [channelsORA.channel5]: values[index++]
                }],
                "APPLE": [{
                    [channelsAPP.channel0]: values[index++],
                    [channelsAPP.channel1]: values[index++],
                    [channelsAPP.channel2]: values[index++],
                    [channelsAPP.channel3]: values[index++],
                    [channelsAPP.channel4]: values[index++],
                    [channelsAPP.channel5]: values[index++]
                }],
                "GOOGLE": [{
                    [channelsGOO.channel0]: values[index++],
                    [channelsGOO.channel1]: values[index++],
                    [channelsGOO.channel2]: values[index++],
                    [channelsGOO.channel3]: values[index++],
                    [channelsGOO.channel4]: values[index++],
                    [channelsGOO.channel5]: values[index++]
                }],
                "MICROSOFT": [{
                    [channelsMIC.channel0]: values[index++],
                    [channelsMIC.channel1]: values[index++],
                    [channelsMIC.channel2]: values[index++],
                    [channelsMIC.channel3]: values[index++],
                    [channelsMIC.channel4]: values[index++],
                    [channelsMIC.channel5]: values[index++]
                }]
            });
        });
        // END 42 "tasks" in parallel. we put await because we need all results before construct the json   

    } catch (error) {
        requestError(error, req, res);
    }
});

// GET //serviceStatus   # contract in body for Auth
router.get('/serviceStatus', auth, async (req, res) => {
    try {
        // TODO: check APIS       

        // START 43 "tasks" in parallel. we put await because we need all results before construct the json   
        await Promise.all([
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
            redisconf.hgetOrNull("collectorsms:VOD", "operator"),

            //Batch Collectors
            redisconf.hgetOrNull("collectorsms:batchSMS", "status"),
            redisconf.hgetOrNull("collectorsms:batchSMS", "interval"),
            redisconf.hgetOrNull("collectorsms:batchSMS", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:batchSMS", "last"),
            redisconf.hgetOrNull("collectorsms:batchPNS", "status"),
            redisconf.hgetOrNull("collectorsms:batchPNS", "interval"),
            redisconf.hgetOrNull("collectorsms:batchPNS", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:batchPNS", "last"),

            //MQ
            redisconf.hgetOrNull("mqpns", "last"),
            redisconf.hgetOrNull("mqsms", "last"),

            //Retries Collectors
            redisconf.hgetOrNull("collectorsms:retriesSMS", "status"),
            redisconf.hgetOrNull("collectorsms:retriesSMS", "interval"),
            redisconf.hgetOrNull("collectorsms:retriesSMS", "intervalControl"),
            redisconf.hgetOrNull("collectorsms:retriesSMS", "last"),
            redisconf.hgetOrNull("collectorpns:retriesPNS", "status"),
            redisconf.hgetOrNull("collectorpns:retriesPNS", "interval"),
            redisconf.hgetOrNull("collectorpns:retriesPNS", "intervalControl"),
            redisconf.hgetOrNull("collectorpns:retriesPNS", "last"),

            //APIS
            redisconf.hgetOrNull("apiadmin", "last"),            
            redisconf.hgetOrNull("apisms", "last"),
            redisconf.hgetOrNull("apipns", "last"),
            redisconf.hgetOrNull("apistatusback", "last")

        ]).then(values => {
            let index = 0;
            res.send({
                Status: "200 OK",
                description: "status[1:ON, 0:OFF] - interval[cron(ms)] - intervalControl[cronController(ms)] - lastExecutionCheckControl[last CronController execution] - operator[Contingency]",
                "APPLE-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "GOOGLE-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "MICROSOFT-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "MOVISTAR-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "VIP-MOVISTAR-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "ORANGE-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "VODAFONE-collector": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++],
                    operator: values[index++]
                }],
                "SMS-Batch": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++]
                }],
                "PNS-Batch": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++]
                }],
                "SMS-MQ": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
                "PNS-MQ": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
                "SMS-Retries": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++]
                }],
                "PNS-Retries": [{
                    status: values[index++],
                    interval: values[index++],
                    intervalControl: values[index++],
                    lastExecutionCheckControl: values[index++]
                }],
                "API-ADMIN": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
                "API-SMS": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
                "API-PNS": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
                "API-STATUSBACK": [{
                    status: 1,
                    lastRestart: values[index++]
                }],
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

// PATCH //operatorContingency   # contract in body for Auth
router.patch('/operatorContingency', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.operator) throw new Error("you need params name & operator in your /operatorContingency request body.");
        if (!validateOperator("SMS", req.body.operator)) throw new Error("Operator is invalid, it must be one of this options: 'MOV', 'VIP', 'ORA' or 'VOD'.");
        if (!validateOperator("SMS", req.body.name)) throw new Error("Name is invalid, it must be one of this options: 'MOV', 'VIP', 'ORA' or 'VOD'.");

        let toUpdate = { operator: req.body.operator };
        // Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.
        await Promise.all([
            updateCollectorSms(req.body.name, toUpdate), // update Collector SMS in MongoDB
            redisconf.hset("collectorsms:" + req.body.name, "operator", req.body.operator)
        ]);
        // END Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.

        let info = " Contingency: The Collector SMS " + req.body.name + " has been change Operator for " + req.body.operator + ".";
        res.send({
            Status: "200 OK",
            info,
            name: req.body.name,
            operator: req.body.operator
        });

        console.log(process.env.GREEN_COLOR, logTime(new Date()) + info);

    } catch (error) {
        requestError(error, req, res);
    }
});

// PATCH //changeCollector   # contract in body for Auth
router.patch('/changeCollector', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.interval || !req.body.intervalControl) throw new Error("you need params name, status, interval & intervalControl in your /changeCollector request body.");
        if (req.body.status != 0 && req.body.status != 1) throw new Error("Status must be a number: 1 (ON) or 0 (OFF).");
        if (req.body.interval < 0 || req.body.intervalControl < 0) throw new Error("Interval or IntervalControl must be a number <0. ");
        let SMSrequest = validateOperator("SMS", req.body.name);
        let PNSrequest = validateOperator("PNS", req.body.name);
        if (!SMSrequest && !PNSrequest) throw new Error("Name is invalid, it must be one of this options for SMS: 'MOV', 'VIP', 'ORA' or 'VOD'. Or for PNS: 'APP', 'GOO' or 'MIC'");
        if (!Number.isInteger(req.body.interval) || !Number.isInteger(req.body.status) || !Number.isInteger(req.body.intervalControl)) throw new Error("Params status, interval and intervalControl must be a Number (Integer)");

        let toUpdate = {
            status: req.body.status,
            interval: req.body.interval,
            intervalControl: req.body.intervalControl
        };

        if (SMSrequest) {
            // Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.
            await Promise.all([
                updateCollectorSms(req.body.name, toUpdate), // update Collector SMS in MongoDB
                redisconf.hmset(["collectorsms:" + req.body.name,
                    "status", req.body.status,
                    "interval", req.body.interval,
                    "intervalControl", req.body.intervalControl
                ])
            ]);
            // END Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.

            let info = "Changed Collector PNS " + req.body.name + " has been change configuration for status:" + req.body.status + ", interval:" + req.body.interval + ", intervalControl:" + req.body.intervalControl + " .";
            res.send({
                Status: "200 OK",
                info,
                name: req.body.name,
                operator: req.body.operator
            });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + info);
        } else {
            // Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.
            await Promise.all([
                updateCollectorPns(req.body.name, toUpdate), // update Collector SMS in MongoDB
                redisconf.hmset(["collectorpns:" + req.body.name,
                    "status", req.body.status,
                    "interval", req.body.interval,
                    "intervalControl", req.body.intervalControl
                ])
            ]);
            // END Execute in Parallel 2 tasks, before response we need to do all tasks for this reason we put await.

            let info = " Contingency: The Collector SMS " + req.body.name + " has been change configuration for status:" + req.body.status + ", interval:" + req.body.interval + ", intervalControl:" + req.body.intervalControl + " .";
            res.send({
                Status: "200 OK",
                info,
                name: req.body.name,
                operator: req.body.operator
            });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + info);
        }






    } catch (error) {
        requestError(error, req, res);
    }
});


// GET /loadRedis    # contract in body for Auth
router.get('/loadRedis', auth, async (req, res) => {
    try {
        loadRedisConf();
        res.send({ Status: "200 OK", info: "Loading all Data in RedisConf..." });
    } catch (error) {
        //TODO personalize errors 400 or 500. 
        requestError(error, req, res);
        //TODO: save error in db  or mem.
    }
});

const requestError = async (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}

module.exports = router