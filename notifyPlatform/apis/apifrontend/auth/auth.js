/*
 * Auth for API
 *   JWT example (no base64 encoded in secret), test in jwt.io : 
 *      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.RSLawzTU4yX-XwnEZtvWipIBOTOji9LKbkuM391zjss
 * 
 *    secret : pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT
 *
 * data : { "alg": "HS256", "typ": "JWT"  }  
 * payload :  {   "sub": "1234567890",  "name": "John Doe",  "contract": "OTPLOWEB", "iat": 2016239022 }
 */

"use strict";

const jwt = require('jsonwebtoken');
const { dateFormat } = require('../util/formats');

const auth = async (req, res, next) => {
    try {

        const token = req.header('x-api-key').replace('Bearer ', '');
        if (token !== null && token.length > 100) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.contract != req.body.contract) {
                throw new Error('You need to authenticate on the platform. Please authenticate before proceeding.');
            }
        }
        next();
    } catch (error) {
        const errorJson = { StatusCode: "401 Unauthoritzed", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFormal: replace T with a space && delete the dot and everything after
        console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));        
        res.status(401).send(errorJson);
    }
}

module.exports = auth