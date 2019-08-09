/*
 * format util for notify platform. 
 *
 */

 //methods to expose
const dateFormat =  ( date ) =>{
   return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

 module.exports = {dateFormat}
