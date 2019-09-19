/*
 * redis util for notify platform. we use async functions that returns new Promises in this class 
 *        * because If we need manage and return the errors or results inside asyncronous callbacks, If we didn't use Promises it would be impossible (we could use EventEmitter too).
 *        * we prefer to use asynchronous functions because they make possible to use await and we can also put some code before or after Promise, if necessary.
 *
 */

//Dependencies
const { rclient } = require('../config/redisconf');

//methods 

// this method gets hash name and its property, in a generic way
const hgetOrNull = async (name, key) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.hget(name, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result //If we don't find the name:key we return null.                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result value of property hash contract
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method gets hash name and its property, in a generic way
const hget = async (name, key) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.hget(name, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Problem in the configuration [' + name + '] does not have [' + key + '] property, you need to reconfigure it before proceding.'); //If we don't find the name:key.                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result value of property hash contract
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method sets hash property and value, in a generic way
const hset = async (hash, property, value) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.hset(hash, property, value, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result value of property hash contract
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method sets N hash properties and values, in a generic way
const hmset = async (hashproperties) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.hmset(hashproperties, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result                                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
    //.then((result) => { return result; })  //return the result value of property hash contract
    //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method save Json in a list (like qeues MQ)
const lpush = async (name, value) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.lpush(name, value, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we didn\'t save value with  redis LPUSH in list because a undefined problem, it\'s necessary check the problem before proceding.');   //If we cannot save the value, maybe we don't have enough memory, infraestructure problem or something like that
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    });
        //.then((result) => { return result; }) //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method save id's in a SET for checking retries or errors.
const sadd = async (name, value) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.sadd(name, value, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we didn\'t save value with redis SADD because a undefined problem, it\'s necessary check the problem before proceding.');   //If we cannot save the value, maybe we don't have enough memory, infraestructure problem or something like that                  
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}


// this method gets variable value, in a generic way
const get = async (name) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.get(name, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result                                
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error. A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result value of property hash contract
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...A reject callback will pass through here
}

// this method save variable value.
const set = async (name, value) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.set(name, value, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter               
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('we didn\'t save value with redis SET because a undefined problem, it\'s necessary check the problem before proceding.');   //If we cannot save the value, maybe we don't have enough memory, infraestructure problem or something like that
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}


// this method put 1 list message to other list and remove from source list
const rpoplpush = async function (source, destination) {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.rpoplpush(source, destination, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result, // even if result = null we return it.
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    });
        //.then((result) => { return result; }) //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

// this method delete 1 list message.
const rpop = async function (name) {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.rpop(name, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback for errors or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error.  If we used reject the try/catch would be unnecessary 
                else resolve(result); // everything is OK, return result, // even if result = null we return it.
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    });
        //.then((result) => { return result; })  //return the result 
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { hget, hset, hmset, lpush, sadd, set, get, rpop, rpoplpush, hgetOrNull }