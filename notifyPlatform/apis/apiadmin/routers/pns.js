/*
 * API REST for status and manage PNS notifications
 *
 */

"use strict";

//Dependencies
const express = require('express');
const auth = require('../auth/auth');
const redisconf = require('../util/redisconf');
const { TokenPns } = require('../config/mongoosemulti');  // Attention : this Pns Model is model created for multi DB
const { findPNS, saveTokenPns } = require('../util/mongomultipns');
const { dateFormatWithMillis, logTime, descStatus, validateOperator } = require('../util/formats');


const router = new express.Router();

// GET /pnstatus   # uuid in body or telf and dates in body, and contract or all
router.get('/pnsStatus', auth, async (req, res) => {
    try {
        if (!req.body._id) throw new Error("Param _id doesn't exist in your /pnsStatus request body.");
        else {
            let condition = { _id: req.body._id };
            var pns = await findPNS(condition);
            if (pns) {
                if (pns.dispatchedAt) res.send({ Status: "200 OK", _id: pns._id, status: pns.status, description: descStatus("PNS", pns.status), receivedAt: dateFormatWithMillis(pns.receivedAt), dispatchedAt: dateFormatWithMillis(pns.dispatchedAt), pns });
                else res.send({ Status: "200 OK", _id: pns._id, status: pns.status, description: descStatus("PNS", pns.status), receivedAt: dateFormatWithMillis(pns.receivedAt), pns });
            } else {
                res.send({ Status: "200 OK", _id: req.body._id, status: "-1", description: "PNS not found" });
            }
            redisconf.hincrby1("apiadmin", "processed");
        }
    } catch (error) {
        requestError(error, res);
    }
});



// POST /tokenRegister  # contract in body
router.post('/tokenRegister', auth, async (req, res) => {
    try {
        if (!req.body.token || !req.body.uuiddevice || !req.body.operator || !req.body.contractToken || !req.body.application || !req.body.user)   //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        if (!validateOperator("PNS", req.body.operator)) throw new Error("Operator is invalid, it must be one of this options for PNS: 'APP', 'GOO' or 'MIC'");

        var TokenModel = TokenPns();  // we catch the ContractSMS Model
        var token = new TokenModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        token.contract = req.body.contractToken;
        token.activated = true;

        await token.validate(); // we need await for validations before save anything
        saveTokenPns(token)
            .then(() => {
                res.send({ Status: "200 OK", info: "Token created", token });

                redisconf.hmset(["tokenpns" + token.application + ":" + token.uuiddevice, //save in RedisConf                           
                    "application", token.application,
                    "contract", token.contract,
                    "uuiddevice", token.uuiddevice,
                    "token", token.token,
                    "user", token.user,
                    "operator", token.operator
                ]);
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS Token created : " + JSON.stringify(token));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                redisconf.hincrby1("apiadmin", "processed");
            })
            .catch(error => { //we don'r need result, but we need errors. 
                requestError(error, res);
            })
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