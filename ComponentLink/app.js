
"use strict";

/*  FIND RELATIONS
Prepare Excel without Repetitions. 
With type, component and order we need and array of arrays like that : 
    arrayOfArrays.push({ CA: 'CA.OFI.Component4' , SI: 'SI.MCA.Component4' , SN: 'SN.MCA.Component6', BE: 'BE.DECDEC', DB: 'DECO02P' });  https://stackoverflow.com/questions/45331972/nodejs-how-can-i-create-multidimensional-array

0. Ask Arguments:
    Type of initial component : (CA, SI, SN, BE or DB) :    
    Name of Component : e.g. CA.OFI.Component    
    Search Order:  "CA -> SI -> SN -> BE -> DB" or "DB -> BE -> SN -> SI -> CA"  :  true or false 
        if true  : normal determine the sheet to search -> CA: always 0, SI:1 , SN:2, BE:3 , DB: always 3 (error)  
        if false : invers determine the sheet to search -> CA: always 3 (error), SI:3 , SN:2, BE:1 , DB: always 0  
    *With this info we have to know the sheets we need 
    
    
1. find the relations with component with SMEMBERS
2. When we find we execute all pushes in arrayOfArrays
3. Continue search next component. 
4. 

*/


//DEPENDENCIES
const redis = require("redis");
const prompts = require('prompts');
const fs = require('fs');


//vars & //ARGUMENTS
const response = {};
var PREFIX = 'n_'
var FINAL_INDEX = 1;
var arrayOfArrays = [];



//REDIS CONFIG & INIT
const client = redis.createClient({ host: '192.168.99.100', port: '6379' });
client.on("error", function (error) {
    console.error(error);
});
/* TEST REDIS
client.set("key", "value", redis.print);
client.get("key", redis.print); 
END TEST REDIS*/


const init = async function () {
    await getResponsePrompts();
    console.log(response);

    let component = response.component;
    let order = response.order;
    FINAL_INDEX = response.searchDepth;

    if (response.onlyCA) {
        PREFIX = order ? 'nc_' : 'rc_';
    } else {
        PREFIX = order ? 'n_' : 'r_';
    }


    if (response.onlyBE) {
        await recursiveMethodOnlyBE(component, {}, -1);
    } else if (response.jumpSI) {
        await recursiveMethodWithoutSI(component, {}, -1);
    } else {
        await recursiveMethod(component, {}, -1);
    }



    if (arrayOfArrays.length < 3000) {
        console.table(arrayOfArrays);
    } else {
        let file = fs.createWriteStream('tabledata.txt');
        file.on('error', function (err) { /* error handling */ });
        arrayOfArrays.forEach(function (element) { file.write(JSON.stringify(element) + '\n'); });
        file.end();
        console.log('\x1b[36m', 'Too Much Results, the result.txt file was saved!');
    }
    /* let data = [
        ['0A', '0B', '0C'],
        ['1A', '1B', '1C'],
        ['2A', '2B', '2C']
    ]; */
}



// method getResponsePrompts async, for get the user response before searching.
const getResponsePrompts = async () => {

    /* response.type = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Choose component type',
        choices: [
            { title: 'CA', value: 'CA' },
            { title: 'SI', value: 'SI' },
            { title: 'SN', value: 'SN' },
            { title: 'SNBE', value: 'SNBE' },
            { title: 'BE', value: 'BE' },
            { title: 'SA', value: 'SA' },
            { title: 'DB', value: 'DB' },
        ],
        initial: 0
    })).value; */

    response.component = (await prompts({
        type: 'text',
        name: 'value',
        message: 'Component to search?  (complet name please)'
    })).value;

    response.order = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Choose direction',
        choices: [
            { title: 'Normal: CA->SI->SN->BE->DB/SA', value: true },
            { title: 'Reverse: DB/SA->BE->SN->SI->CA', value: false },
        ],
        initial: 0
    })).value;

    if (response.component.substring(0, 2) == 'CA') {
        response.onlyCA = (await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want only CAs?',
            choices: [
                { title: 'NO', value: false },
                { title: 'YES', value: true },
            ],
            initial: false
        })).value;
    } else {
        response.onlyCA = false;
    }

    response.searchDepth = (await prompts({
        type: 'number',
        name: 'value',
        message: 'Choose search depth (1-6). Performance decrease with higher numbers.',
        validate: value => value < 1 ? `increase number please` : true,
        initial: 5
    })).value;

    response.onlyBE = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Do you want only BE?',
        choices: [
            { title: 'NO', value: false },
            { title: 'YES', value: true },
        ],
        initial: false
    })).value;

    if (!response.onlyBE) {
        response.jumpSI = (await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want jump SI?',
            choices: [
                { title: 'NO', value: false },
                { title: 'YES', value: true },
            ],
            initial: false
        })).value;
    }

}


const recursiveMethod = async function (component, jsonPrev, index) {
    let json = JSON.parse(JSON.stringify(jsonPrev)); // we need new json object
    index = index + 1;  // we add index before for.    
    json['component' + index] = component; //add component to json
    if (index < FINAL_INDEX) {
        let arrayComponents = await getAllComponents(PREFIX + component); //find components with relationship
        if (arrayComponents.length == 0) {
            arrayOfArrays.push(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                let cancel = false;
                for (var attribute in json) { //we need to test component don't call the a same component as before
                    if (json[attribute] == nextComponent) {
                        cancel = true; //if the component is the same we cancel work
                        break;
                    }
                }
                if (cancel) { //cancel the work
                    json['component' + (index + 1)] = nextComponent;
                    arrayOfArrays.push(json); //add json to global array
                } else { //continue work                   
                    await recursiveMethod(nextComponent, json, index);
                }
            }
        }
    } else {
        arrayOfArrays.push(json); //add json to global array
    }
}

const recursiveMethodWithoutSI = async function (component, jsonPrev, index) {
    let json = JSON.parse(JSON.stringify(jsonPrev)); // we need new json object    
    index = index + 1;  // we add index before for.
    if (component.substring(0, 2) != 'SI') {
        json['component' + index] = component; //add component to json
    }

    if (index < FINAL_INDEX) {
        let arrayComponents = await getAllComponents(PREFIX + component); //find components with relationship
        if (arrayComponents.length == 0) {
            arrayOfArrays.push(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                let cancel = false;
                for (var attribute in json) { //we need to test component don't call the a same component as before
                    if (json[attribute] == nextComponent) {
                        cancel = true; //if the component is the same we cancel work
                        break;
                    }
                }
                if (cancel) { //cancel the work
                    json['component' + (index + 1)] = nextComponent;
                    arrayOfArrays.push(json); //add json to global array
                } else { //continue work                   
                    await recursiveMethodWithoutSI(nextComponent, json, index);
                }
            }
        }
    } else {
        arrayOfArrays.push(json); //add json to global array
    }
}

const recursiveMethodOnlyBE = async function (component, jsonPrev, index) {
    let json = JSON.parse(JSON.stringify(jsonPrev)); // we need new json object    
    index = index + 1;  // we add index before for.
    if (component.substring(0, 2) == 'BE') {
        json['component' + index] = component; //add component to json
    }

    if (index < FINAL_INDEX) {
        let arrayComponents = await getAllComponents(PREFIX + component); //find components with relationship
        if (arrayComponents.length == 0) {
            if (Object.keys(json).length > 0) arrayOfArrays.push(json); //add json to global array
        } else {
            let iterator = arrayComponents.values();
            for (let nextComponent of iterator) { //iterate components with relationship
                let cancel = false;
                for (var attribute in json) { //we need to test component don't call the a same component as before
                    if (json[attribute] == nextComponent) {
                        cancel = true; //if the component is the same we cancel work
                        break;
                    }
                }
                if (cancel) { //cancel the work
                    if (component.substring(0, 2) == 'BE') json['component' + (index + 1)] = nextComponent;
                    if (Object.keys(json).length > 0) arrayOfArrays.push(json); //add json to global array
                } else { //continue work                   
                    await recursiveMethodOnlyBE(nextComponent, json, index);
                }
            }
        }
    } else {
        if (Object.keys(json).length > 0) arrayOfArrays.push(json); //add json to global array
    }
}


const getAllComponents = async function (component) {
    return new Promise((resolve, reject) => {
        client.smembers(component, (error, result) => { //get result or error
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here.
}

//INIT Function
init();
