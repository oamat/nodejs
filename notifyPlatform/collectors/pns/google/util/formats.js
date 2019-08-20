/*
 * format util for notify platform. 
 *
 */

//methods to expose
const dateFormat = (date) => {
   return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

const buildChannel = (operator, priority) => {
   return "PNS." + operator + "." + priority;
}

const buildChannels = (operator) => {
   return { channel0: buildChannel(operator, 0), channel1: buildChannel(operator, 1), channel2: buildChannel(operator, 2), channel3: buildChannel(operator, 3) };
}


module.exports = { dateFormat, buildChannel, buildChannels }
