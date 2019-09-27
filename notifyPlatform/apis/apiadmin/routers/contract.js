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
router.post('/contractRegister', auth, async (req, res) => {
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
            findContractSms({ name: contract.name }).then((result) => {
                if (result) {
                    updateContractSms({ _id: result._id }, { operator: contract.operator, application: contract.application, description: contract.description, interface: contract.interface, permission: contract.permission, remitter: contract.remitter })
                        .then((contract) => {
                            res.send({ Status: "200 OK", info: "Contract Updated", contract });
                            saveInRedis(contract);
                            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Contract updated : " + contract._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                            redisconf.hincrby1("apiadmin", "processed");
                        })
                        .catch(error => {
                            requestError(error, res);
                        });
                } else {
                    saveContractSms(contract)
                        .then((contract) => { // save Contract SMS in MongoDB
                            res.send({ Status: "200 OK", info: "contract created", contract });
                            saveInRedis(contract);
                            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Contract created : " + contract._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                            redisconf.hincrby1("apiadmin", "processed");
                        })
                        .catch(error => {     // we need catch only if get 'await' out          
                            requestError(error, res);  //and return json error to client
                        });
                }
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
            findContractPns({ name: contract.name }).then((result) => {
                if (result) {
                    updateContractPns({ _id: result._id }, { operator: contract.operator, application: contract.application, description: contract.description, interface: contract.interface, permission: contract.permission, remitter: contract.remitter })
                        .then((contract) => {
                            res.send({ Status: "200 OK", info: "Contract Updated", contract });
                            saveInRedis(contract);
                            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS Contract updated : " + contract._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                            redisconf.hincrby1("apiadmin", "processed");
                        })
                        .catch(error => {
                            requestError(error, res);
                        });
                } else {
                    saveContractPns(contract)
                        .then((contract) => { // save Contract PNS in MongoDB
                            res.send({ Status: "200 OK", info: "contract created", contract });
                            saveInRedis(contract);
                            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS Contract created : " + contract._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                            redisconf.hincrby1("apiadmin", "processed");
                        })
                        .catch(error => {     // we need catch only if get 'await' out          
                            requestError(error, res);  //and return json error to client
                        });
                }
            });
        } else throw new Error("type param is invalid, it must be one of this options: 'SMS'or 'PNS'.");

    } catch (error) {
        requestError(error, res);
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
            redisconf.hincrby1("apiadmin", "processed");
        }
    } catch (error) {
        requestError(error, res);
    }
});


const saveInRedis = async (contract) => {

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

}

const requestError = async (error, res) => {
    //TODO personalize errors 400 or 500. 
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    redisconf.hincrby1("apiadmin", "errors");
    //TODO: save error in db  or mem.
}

module.exports = router