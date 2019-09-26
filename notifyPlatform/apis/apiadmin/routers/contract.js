/*
 * API REST for manage contracts
 *      /addSmsContract : save new SMS Contract and create new jwt per application in MongoDB
 *      /addPnsContract : save new PNS Contract and create new jwt per application in MongoDB
 *      /getContract  : return the contract detail
 *      /updateContract  : update contract
 *
 */

"use strict";

//Dependency
const { ContractSms, ContractPns } = require('../config/mongoosemulti');  // Attention : this Sms Model is model created for multi DB
const express = require('express');
const auth = require('../auth/auth');
const { dateFormat, logTime, replaceSpaces, validateOperator, validateInterface, validatePermission } = require('../util/formats');
const { saveContractSms, findContractSms, updateContractSms } = require('../util/mongomultisms');
const { saveContractPns, findContractPns, updateContractPns } = require('../util/mongomultipns');
const redisconf = require('../util/redisconf');
const jwt = require('jsonwebtoken');

const router = new express.Router();


// POST //addContract   # contract in body for Auth
router.post('/addContract', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.type || !req.body.description || !req.body.permission || !req.body.application || !req.body.interface || !req.body.operator || !req.body.remitter)  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");

        if (req.body.type == "SMS") {
            let ContractModel = ContractSms();  // we catch the ContractSMS Model
            let contract = new ContractModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
            contract.defaultOperator = contract.operator;
            contract.activated = true;
            contract.name = replaceSpaces(contract.name).toUpperCase();
            contract.application = replaceSpaces(contract.application).toUpperCase();
            contract.jwt = jwt.sign({ sub: "1234567890", name: contract.name, contract: contract.name, "iat": 2016239022 }, process.env.JWT_SECRET);
            await contract.validate(); // we need await for validations before save anything
            saveContractSms(contract)
                .catch(error => {     // we need catch only if get 'await' out          
                    throw error;  //and return json error to client
                })
                .then(() => { // save Contract SMS in MongoDB
                    redisconf.hmset(["contractsms:" + contract.name, //save in RedisConf               
                        "jwt", contract.jwt,
                        "operator", contract.operator,
                        "defaultOperator", contract.defaultOperator,
                        "activated", contract.activated,
                        "permission", contract.permission,
                        "application", contract.application,
                        "interface", contract.interface,
                        "remitter", contract.remitter
                    ]).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); });
                    res.send({ Status: "200 OK", info: "contract created", contract });
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Contract created : " + JSON.stringify(contract));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                });
        } else if (req.body.type == "PNS") {
            var ContractModel = ContractPns();  // we catch the ContractSMS Model
            var contract = new ContractModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
            contract.defaultOperator = contract.operator;
            contract.activated = true;
            contract.name = replaceSpaces(contract.name).toUpperCase();
            contract.application = replaceSpaces(contract.application).toUpperCase();
            contract.jwt = jwt.sign({ sub: "1234567890", name: contract.name, contract: contract.name, "iat": 2016239022 }, process.env.JWT_SECRET);
            await contract.validate(); // we need await for validations before save anything
            saveContractPns(contract)
                .catch(error => {     // we need catch only if get 'await' out          
                    throw error;  //and return json error to client
                })
                .then(() => { // save Contract SMS in MongoDB
                    redisconf.hmset(["contractpns:" + contract.name, //save in RedisConf               
                        "jwt", contract.jwt,
                        "operator", contract.operator,
                        "defaultOperator", contract.defaultOperator,
                        "activated", contract.activated,
                        "permission", contract.permission,
                        "application", contract.application,
                        "interface", contract.interface
                    ]).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); });
                    res.send({ Status: "200 OK", info: "contract created", contract });
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS Contract created : " + JSON.stringify(contract));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                });
        } else throw new Error("type param is invalid, it must be one of this options: 'SMS'or 'PNS'.");

    } catch (error) {
        requestError(error, req, res);
    }
});


// GET ////getContract    # contract in body for Auth
router.get('/getContract', auth, async (req, res) => {
    try {

        if (!req.body.name || !req.body.type) throw new Error("you need params name & type in your /getContract request body.");
        else if (req.body.type != "SMS" && req.body.type != "PNS") throw new Error("Type param must be one of this options: 'SMS' or 'PNS'.");
        else {
            let condition = { name: req.body.name };
            var contract;
            if (req.body.type == "PNS") {
                contract = await findContractPns(condition);
            } else {
                contract = await findContractSms(condition);
            }
            if (contract) {
                res.send({ Status: "200 OK", contract });
            } else {
                res.send({ Status: "200 OK", name: req.body.name, type: req.body.type, description: "Contract not found." });
            }
        }
    } catch (error) {
        requestError(error, req, res);
    }
});

// PATCH //updateContract (activated, operator, etc)     # contract in body for Auth
router.patch('/changeContract', auth, async (req, res) => {
    try {

        if (!req.body.name || !req.body.operator || !req.body.activated || !req.body.frontend || !req.body.type || !req.body.interface) throw new Error("you need params name, type, operator, activated and frontend in your /updateContract request body.");
        if (req.body.activated != "true" && req.body.activated != "false") throw new Error("activated param must to be Boolean.");
        if (!validateInterface(req.body.interface)) throw new Error("Interface param is invalid, it must be one of this options: 'REST', 'BATCH', 'MQ' or 'ALL'.");
        if (!validatePermission(req.body.frontend)) throw new Error("FrontEnd permission is invalid, it must be one of this options: 'THIS':only this contract, 'WITHIN_APP': contracts with the same application, 'ALL': All contracts.");
        if (!validatePermission(req.body.permission)) throw new Error("Permission is invalid, it must be one of this options: 'THIS':only this contract, 'WITHIN_APP': contracts with the same application, 'ALL': All contracts.");
        if (req.body.type == "SMS") {
            if (!validateOperator("SMS", req.body.operator)) throw new Error("Operator param is invalid, it must be one of this options for SMS: 'MOV', 'VIP', 'ORA', 'VOD' or 'ALL'.");
            let toUpdate = { operator: req.body.operator, activated: req.body.activated, frontend: req.body.frontend, interface: req.body.interface };
            updateContractSms(req.body.name, toUpdate)
                .catch(error => {     // we need catch only if get 'await' out          
                    throw error;  //and return json error to client
                })
                .then(() => { // update Contract SMS in MongoDB
                    redisconf.hmset(["contractsms:" + req.body.name,
                        "operator", req.body.operator,
                        "activated", req.body.activated,
                        "frontend", req.body.frontend,
                        "interface", req.body.interface
                    ]);
                    let info = "Changed SMS Contract : " + req.body.name + " configuration has been change for operator:" + req.body.operator + ", activated:" + req.body.activated + ", interface" + req.body.interface + " and frontend:" + req.body.frontend + " .";
                    res.send({ Status: "200 OK", info });
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + info);
                });
        } else if (req.body.type == "PNS") {
            if (!validateOperator("PNS", req.body.operator)) throw new Error("Operator param is invalid, it must be one of this options for PNS: 'APP', 'GOO', 'MIC' or 'ALL'.");
            let toUpdate = { operator: req.body.operator, activated: req.body.activated, frontend: req.body.frontend, interface: req.body.interface };
            updateContractPns(req.body.name, toUpdate)
                .catch(error => {     // we need catch only if get 'await' out          
                    throw error;  //and return json error to client
                })
                .then(() => { // update Contract SMS in MongoDB
                    redisconf.hmset(["contractpns:" + req.body.name,
                        "operator", req.body.operator,
                        "activated", req.body.activated,
                        "frontend", req.body.frontend,
                        "interface", req.body.interface
                    ]);
                    let info = "Changed PNS Contract : " + req.body.name + " configuration has been change for operator:" + req.body.operator + ", activated:" + req.body.activated + ", interface:" + req.body.interface + " and frontend:" + req.body.frontend + ".";
                    res.send({ Status: "200 OK", info });
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + info);
                });
        } else throw new Error("type param is invalid, it must be one of this options: 'SMS'or 'PNS'.");
    } catch (error) {
        requestError(error, req, res);
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