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

const buildSMSChannels = (operator) => {
   return {
      channel0: buildSMSChannel(operator, 0),
      channel1: buildSMSChannel(operator, 1),
      channel2: buildSMSChannel(operator, 2),
      channel3: buildSMSChannel(operator, 3),
      channel4: buildSMSChannel(operator, 4),
      channel5: buildSMSChannel(operator, 5)
   }
}


const buildPNSChannel = (operator, priority) => {
   return "PNS." + operator + "." + priority;
}

const buildPNSChannels = (operator) => {
   return {
      channel0: buildSMSChannel(operator, 0),
      channel1: buildSMSChannel(operator, 1),
      channel2: buildSMSChannel(operator, 2),
      channel3: buildSMSChannel(operator, 3),
      channel4: buildSMSChannel(operator, 4),
      channel5: buildSMSChannel(operator, 5)
   }
}

const counter = ((i = 0) => () => ++i)();

module.exports = { dateFormat, buildSMSChannel, buildSMSChannels, buildPNSChannel, buildPNSChannels, counter }
