
/*
 * Monitor program
 *   This programs helps to search the state of a SMS o PNS notify via SSH, BBDD, etc 
 */

"use strict";

// Dependencies
require('../config/config.js');
const prompts = require('prompts');
const response = {};

/*  **********
 *   METHODS
 *  ********** 
 */

// method getResponse async, for get the user info before searching.
const getResponse = async () => {

    response.sms_pns = (await prompts({
        type: 'number',
        name: 'value',
        message: '0.SMS or 1.PNS?',
        validate: value => value > 2 ? "0 o 1" : true
    })).value;

    if (response.sms_pns == "1") {

        response.uuid_refuser_both = (await prompts({
            type: 'number',
            name: 'value',
            message: '0.UUID or 1.RefUser or 2.Both Params?',
            validate: value => value > 2 ? "0,1 o 2" : true
        })).value;

        if (response.uuid_refuser_both == "2") {

            response.refuser = (await prompts({
                type: 'text',
                name: 'value',
                message: 'RefUser? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;

            response.uuid = (await prompts({
                type: 'text',
                name: 'value',
                message: 'UUID? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;


        } else if (response.uuid_refuser_both == "1") {

            response.refuser = (await prompts({
                type: 'text',
                name: 'value',
                message: 'RefUser? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;

        } else {

            response.uuid = (await prompts({
                type: 'text',
                name: 'value',
                message: 'UUID? ',
                //validate: value => value.le > 2 ? "1 o 2" : true
            })).value;

        }

    } else {

        response.telf = (await prompts({
            type: 'text',
            name: 'value',
            message: 'Telf?',
            //validate: value => value > 2 ? `1 o 2` : true
        })).value;

    }

    return response;
}

module.exports = { getResponse };