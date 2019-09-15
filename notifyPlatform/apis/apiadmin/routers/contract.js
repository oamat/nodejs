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
const { dateFormat, logTime, replaceSpaces } = require('../util/formats');
const { saveContractSms, findContractSms } = require('../util/mongomultisms');
const { saveContractPns, findContractPns } = require('../util/mongomultipns');
const redisconf = require('../util/redisconf');
const jwt = require('jsonwebtoken');

const router = new express.Router();


// POST //addSmsContract   # contract in body for Auth
router.post('/addSmsContract', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.description || !req.body.permission || !req.body.application || !req.body.interface || !req.body.operator) {  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else {
            let ContractModel = ContractSms();  // we catch the ContractSMS Model
            let contract = new ContractModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
            contract.type = "SMS";
            contract.defaultOperator = contract.operator;
            contract.activated = true;
            contract.name = replaceSpaces(contract.name).toUpperCase();
            contract.application = replaceSpaces(contract.application).toUpperCase();
            contract.jwt = jwt.sign({
                sub: "1234567890",
                name: contract.name,
                contract: contract.name,
                "iat": 2016239022
            },
                process.env.JWT_SECRET
            );

            await contract.validate(); // we need await for validations before save anything
            await Promise.all([  // await is necessary because we have errors, like duplication contract name
                saveContractSms(contract),
                redisconf.hmset(["contractsms:" + contract.name, //save in RedisConf               
                    "jwt", contract.jwt,
                    "operator", contract.operator,
                    "defaultOperator", contract.defaultOperator,
                    "activated", contract.activated,
                    "permission", contract.permission,
                    "application", contract.application,
                    "interface", contract.interface
                ])
            ]).catch(function (error) { //we don'r need result, but we need errors. 
                throw error;
            });

            res.send({
                Status: "200 OK",
                info: "contract created",
                contract
            });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Contract created : " + JSON.stringify(contract));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
        }

    } catch (error) {
        requestError(error, req, res);
    }
});


// POST //addPnsContract   # contract in body for Auth
router.post('/addPnsContract', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.description || !req.body.permission || !req.body.application || !req.body.interface || !req.body.operator) {  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else {
            var ContractModel = ContractPns();  // we catch the ContractSMS Model
            var contract = new ContractModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
            contract.type = "PNS";
            contract.defaultOperator = contract.operator;
            contract.activated = true;
            contract.name = replaceSpaces(contract.name).toUpperCase();
            contract.application = replaceSpaces(contract.application).toUpperCase();
            contract.jwt = jwt.sign({
                sub: "1234567890",
                name: contract.name,
                contract: contract.name,
                "iat": 2016239022
            },
                process.env.JWT_SECRET
            );
            await contract.validate(); // we need await for validations before save anything
            await Promise.all([  // await is necessary because we have errors, like duplication contract name
                saveContractPns(contract),
                redisconf.hmset(["contractpns:" + contract.name, //save in RedisConf               
                    "jwt", contract.jwt,
                    "operator", contract.operator,
                    "defaultOperator", contract.defaultOperator,
                    "activated", contract.activated,
                    "permission", contract.permission,
                    "application", contract.application,
                    "interface", contract.interface
                ])
            ]).catch(function (error) { //we don'r need result, but we need errors. 
                throw error;
            });

            res.send({
                Status: "200 OK",
                info: "contract created",
                contract
            });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS Contract created : " + JSON.stringify(contract));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
        }

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
                res.send({ Status: "200 OK", name: req.body.name, type: req.body.type, description: "Contract not found" });
            }
        }
    } catch (error) {
        requestError(error, req, res);
    }
});

// PATCH //updateContract (activated, operator, etc)     # contract in body for Auth
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