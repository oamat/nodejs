/*
 * redis util for notify platform. 
 *
 */

//Dependencies
const { rclient } = require('../config/redissms');

//methods 


// this method gets hash name and its property, in a generic way
const hgetConf = async function (name, key) {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.hget(name, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Problem in the configuration [' + name + '] does not have [' + key + '] property.'); //If we don't find the name:key.                 
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    })
        .then((result) => { return result; })  //return the result value of property hash contract
        .catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

// this method put 1 list message to other list and remove from source list
const rpoplpush = async function (source, destination) {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.rpoplpush(source, destination, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error. 
                else resolve(result); // everything is OK, return result, // even if result = null we return it.
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    })
        .then((result) => { return result; }) //return the result number
        .catch((error) => { throw error; }); //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

// this method delete 1 list message.
const rpop = async function (name) {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        rclient.rpop(name, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) throw error;  //if redis give me an error. 
                else resolve(result); // everything is OK, return result, // even if result = null we return it.
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.  A reject will not pass through here
        });
    })
        .then((result) => { return result; })  //return the result 
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here
}

module.exports = { hget, rpop, rpoplpush }
