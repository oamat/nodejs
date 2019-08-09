/*
 * redis util for notify platform. 
 *
 */

//Dependencies
const redis = require('../config/redis');

//methods 
const hgetForAuth = async function (contract, key, token) {
    return new Promise((resolve, reject) => {
        redis.client.hget("contract:" + contract, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw new Error(error.message);
                } else if (result == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract is invalid, you need to authenticate on the platform with correct contract. Please authenticate before proceeding.');
                } else if (result != token) { //check that jwt was created from this server and exist in redis Conf                         
                    throw new Error('Your JWT is invalid, you need to authenticate on the platform with correct JWT. Please authenticate before proceeding.');
                }
                resolve(result);
            } catch (error) { reject(error); }
        });
    })
        .then((result) => { return result; })
        .catch((error) => { throw error; });
}

const hget = async function (contract, key) {
    return new Promise((resolve, reject) => {
        redis.client.hget("contract:" + contract, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract does not have ' + key + ', you need to reconfigure it before proceding.');
                }
                resolve(result);
            } catch (error) { reject(error); }
        });
    })
        .then((result) => { return result; })
        .catch((error) => { throw error; });
}

const rpush = async function (name, value) {
    return new Promise((resolve, reject) => {
        redis.client.rpush(name, value, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract does not have ' + key + ', you need to reconfigure it before proceding.');
                }
                resolve(result);
            } catch (error) { reject(error); }
        });
    })
        .then((result) => { return result; })
        .catch((error) => { throw error; });
}


module.exports = { hget, rpush, hgetForAuth }
