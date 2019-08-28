/*
 * format util for notify platform. 
 *
 */

//methods to expose
const dateFormat = (date) => {
   return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

const buildSMSChannel = (operator, priority) => {
   return "SMS." + operator + "." + priority;
}

const buildPNSChannel = (operator, priority) => {
   return "PNS." + operator + "." + priority;
}

const counter = ((i = 0) => () => ++i)();

module.exports = { dateFormat, buildSMSChannel, buildPNSChannel, counter }
