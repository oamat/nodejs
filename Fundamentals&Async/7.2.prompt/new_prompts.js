
/*
 * Monitor program
 *   This programs helps to search the state of a SMS o PNS notify via SSH, BBDD, etc 
 */

"use strict";

// Dependencies
const prompts = require('prompts');
const response = {};

// method getResponse async, for get the user response before searching.
const getResponse = async () => {

    response.sms_pns = (await prompts({
        type: 'number',
        name: 'value',
        message: '0.SMS or 1.PNS?',
        validate: value => value > 2 ? "0 o 1" : true
    })).value;

    if (response.sms_pns == "1") {

        response.uuid_refuser = (await prompts({
            type: 'number',
            name: 'value',
            message: '0.UUID or 1.RefUser?',
            validate: value => value > 1 ? "1 o 2" : true
        })).value;

        if (response.uuid_refuser == "1") {

            response.value = (await prompts({
                type: 'text',
                name: 'value',
                message: 'RefUser? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;

        } else {

            response.value = (await prompts({
                type: 'text',
                name: 'value',
                message: 'UUID? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;

        }

    } else {

        response.value = (await prompts({
            type: 'text',
            name: 'value',
            message: 'Telf?',
            //validate: value => value > 2 ? `1 o 2` : true
        })).value;

    }

}


const init = async () => {
    getResponse();
}

init();
