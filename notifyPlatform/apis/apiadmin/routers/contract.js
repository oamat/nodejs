/*
 * API REST for manage contracts
 *
 */

"use strict";

//Dependency
const { ContractSms, ContractPns } = require('../config/mongoosemulti');  // Attention : this Sms Model is model created for multi DB
const express = require('express');
const auth = require('../auth/auth');
const { dateFormat, logTime } = require('../util/formats');
const { saveContractSms } = require('../util/mongomultisms');
const { saveContractPns } = require('../util/mongomultipns');
const jwt = require('jsonwebtoken');

const router = new express.Router();


// POST //addContract 
router.post('/addContract', auth, async (req, res) => {
    try {
        if (!req.body.name || !req.body.description || !req.body.permision || !req.body.application || !req.body.interface || !req.body.operator) {  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else {
            var ContractModel = ContractSms();  // we catch the ContractSMS Model
            var contract = new ContractModel(req.body); //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
            contract.type = "SMS";
            contract.defaultOperator = contract.operator;
            contract.activated = true;
            contract.jwt = jwt.sign(
                { sub: "1234567890", name: contract.name, contract: contract.name, "iat": 2016239022 },
                process.env.JWT_SECRET
            );
            await contract.validate(); // we need await for validations before save anything
            saveContractSms(contract); // await it's unnecessary because we validate() before
            res.send({
                Status: "200 OK",
                info: "contract created",
                name: contract.name,
                _id: contract._id,
                jwt: contract.jwt,
                interface: contract.interface,
                type: contract.type,
                permision: contract.permision,
                application: contract.application
            });
        }
        //addContract 
    } catch (error) {
        requestError(error, req, res);
    }
});

// GET ////getContract  
router.get('/getContract', auth, async (req, res) => {
    try {
        //getContract
    } catch (error) {
        requestError(error, req, res);
    }
});

// PATCH //updateContract (activated, operator, etc)  
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