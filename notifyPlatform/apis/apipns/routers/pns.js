/*
 * API REST for sending PNS notification
 *   this code only have 1 method, pnsSend:
 *          validates the request
 *          Save data in relevant redis list 
 *          Save data to mongodb
 *
 */

"use strict";

//Dependencies
const express = require('express');
const { Pns } = require('../models/pns');
const auth = require('../auth/auth');
const { savePNS } = require('../util/mongopns');
const { rclient } = require('../config/redispns');
const { hgetall, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime, buildPNSChannel } = require('../util/formats');

const router = new express.Router();
//VARS
const PNS_IDS = "PNS.IDS.PENDING";

//Method post for sending PNS  //status, listby user (by date), list by uuid (by date), registeruuid: app, user, osVendor, osVersion, uuidDevice, token,
router.post('/pnsSend', auth, async (req, res) => {  //we execute auth before this post request method
    //console.log(process.env.WHITE_COLOR, logTime(new Date()) + "PNS new request : " + JSON.stringify(req.body));
    try {
        const pns = new Pns(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        let tokenConf = await hgetall("tokenpns" + pns.application + ":" + pns.uuiddevice); ////find the "token" & "operator" for this application uuiddevice PNS.
        if (!tokenConf || !tokenConf.token || !tokenConf.operator) throw new Error("This uuiddevice is not register, we cannot find its token neither operator : 'tokenpns" + pns.application + ":" + pns.uuiddevice) //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired, 5:token not found (not register)
        pns.token = tokenConf.token; //get the token for this uuiddevice PNS.
        pns.operator = tokenConf.operator; //get the operator for this uuiddevice PNS.
        pns.channel = buildPNSChannel(pns.operator, pns.priority); //get the channel to put notification with operator and priority

        //await pns.validate(); //validate is unnecessary, we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.

        savePNS(pns) //save pns to DB, in this phase we need save PNS to MongoDB. //If you didn't execute "pns.validate()" we would need await in save.
            .then(pns => {  //save method returns pns that has been save to MongoDB
                res.send({ statusCode: "200 OK", _id: pns._id }); //ALL OK, response 200, with pns._id. TODO: is it necessary any more params?
                rclient.multi([ //START Redis Transaction with multi chain and result's callback
                    ["lpush", pns.channel, JSON.stringify(pns)],    //Trans 1
                    ["sadd", PNS_IDS, pns._id]                      //Trans 2             
                ]).exec((error, replies) => { // drains multi queue and runs atomically                    
                    if (error) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: We couldn't save PNS in Redis (We will have to wait for retry): " + error.message);
                });  //END Redis Transaction with multi chain and result's callback               

                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS saved, _id: " + pns._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                hincrby1("apipns", "processed");
            })
            .catch(error => {     // we need catch only if get 'await' out          
                requestError(error, req, res);  //and return json error to client
            });

    } catch (error) {
        requestError(error, req, res);
        //TODO : maybe we can save  the errors in Redis
    }
});

const requestError = async (error, req, res) => {
    //TODO: personalize errors 400 or 500. 
    let contract = req.body.contract || 'undefined';
    let uuiddevice = req.body.uuiddevice || 'undefined';
    let content = req.body.content || 'undefined';
    let application = req.body.application || 'undefined';
    let action = req.body.action || 'undefined';

    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: contract, uuiddevice: uuiddevice, application: application, action: action, content: content, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
    hincrby1("apipns", "errors");
    //TODO: save error in db  or mem.
}
module.exports = router