/*
 * format util for notify platform. 
 *
 */

 //methods to expose
const dateFormat =  ( date ) =>{
   return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

const buildChannel = (operator, priority) => {
   return "SMS." + operator + "." + priority;
}

 module.exports = {dateFormat, buildChannel}
