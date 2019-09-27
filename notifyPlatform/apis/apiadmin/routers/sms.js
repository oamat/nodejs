/*
 * API REST for status and manage SMS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const auth = require('../auth/auth');
const redisconf = require('../util/redisconf');
const { TelfSms } = require('../config/mongoosemulti');  // Attention : this Pns Model is model created for multi DB
const { findSMS, saveTelfSms, findTelfSms, updateTelfSms } = require('../util/mongomultisms');
const { dateFormatWithMillis, logTime, descStatus, validateOperator } = require('../util/formats');


const router = new express.Router();

// GET /smsStatus   # uuid in body or telf and dates in body, and contract or all
router.get('/smsStatus', auth, async (req, res) => {
    try {
        if (!req.body._id) throw new Error("Param _id doesn't exist in your /smsStatus request body.");
        else {
            let condition = { _id: req.body._id };
            findSMS(condition)
                .then((sms) => {
                    if (sms) {
                        if (sms.dispatchedAt) res.send({ Status: "200 OK", _id: sms._id, status: sms.status, description: descStatus("SMS", sms.status), receivedAt: dateFormatWithMillis(sms.receivedAt), dispatchedAt: dateFormatWithMillis(sms.dispatchedAt), sms });
                        else res.send({ Status: "200 OK", _id: sms._id, status: sms.status, description: descStatus("SMS", sms.status), receivedAt: dateFormatWithMillis(sms.receivedAt), sms });
                    } else {
                        res.send({ Status: "200 OK", _id: req.body._id, status: "-1", description: "SMS not found" });
                    }
                    redisconf.hincrby1("apiadmin", "processed");
                })
                .catch(error => {
                    requestError(error, res);
                })
        }
    } catch (error) {
        requestError(error, res);
    }
});


// POST /telfRegister  # contract in body
router.post('/telfRegister', auth, async (req, res) => {
    try {
        if (!req.body.telf || !req.body.operator)   //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        if (!validateOperator("SMS", req.body.operator)) throw new Error("Operator is invalid, it must be one of this options for SMS: 'MOV', 'VIP', 'ORA' or 'VOD'.");

        var TelfModel = TelfSms();  // we catch the ContractSMS Model
        var telf = new TelfModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here.       
        await telf.validate(); // we need await for validations before save anything

        findTelfSms({ telf: telf.telf }).then((result) => {
            if (result) {        
                updateTelfSms({ _id: result._id }, { operator: req.body.operator })
                    .then((telf) => {
                        res.send({ Status: "200 OK", info: "Telf Updated", telf });
                        redisconf.hmset(["telfsms:" + telf.telf, //save in RedisConf         
                            "operator", telf.operator
                        ]);
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Telf updated : " + telf._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                        redisconf.hincrby1("apiadmin", "processed");
                    })
                    .catch(error => {
                        requestError(error, res);
                    });
            } else {
                saveTelfSms(telf)
                    .then((telf) => {
                        res.send({ Status: "200 OK", info: "Telf created", telf });
                        redisconf.hmset(["telfsms:" + telf.telf, //save in RedisConf         
                            "operator", telf.operator
                        ]);
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Telf created : " + telf._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                        redisconf.hincrby1("apiadmin", "processed");
                    })
                    .catch(error => {
                        requestError(error, res);
                    });
            }
        })
            .catch(error => {
                requestError(error, res);
            });        

    } catch (error) {
        requestError(error, res);
    }
});


const requestError = async (error, res) => {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, receiveAt: dateFormatWithMillis(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    redisconf.hincrby1("apiadmin", "errors");
    //TODO: save error in db  or mem.
}


module.exports = router