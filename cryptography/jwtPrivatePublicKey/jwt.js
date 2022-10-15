'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');
/*
 ====================   JWT Signing =====================
*/


const signOptions = {
    issuer: 'CaixaBank',
    subject: 'caixabank@caixabank.com',
    audience: 'http://www.caixabank.es',
    expiresIn : 3, //Here the value of expiresIn is measured in seconds
    algorithm: "RS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
};

const payload = { 
    name:'pepe', 
    userid:1, 
    uuid: '58a32333-ce34-47eb-b43f-1c31bdc08034', 
    company: 'cxb', 
    role: 'user' };

var token = jwt.sign(payload, privateKEY, signOptions);
console.log("Token :" + token);

/*
 ====================   JWT Verify with Private key NOT WORK!!=====================
*/
/* var verifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: "12h",
    algorithm: ["RS256"]
};
var legit = jwt.verify(token, privateKEY, verifyOptions);
console.log("\nJWT verification result: " + JSON.stringify(legit)); */


/*
 ====================   JWT Verify with Public key=====================
*/

var legit = jwt.verify(token, publicKEY, signOptions);
console.log("\nJWT verification result: " + JSON.stringify(legit));


/*
 ====================   JWT DECODE with Public key=====================
*/

var result = jwt.decode(token);
console.log("\nJWT decode result: " + JSON.stringify(result));