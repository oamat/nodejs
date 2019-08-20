const dateFormat =  ( date ) =>{
   return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

 module.exports = {
    dateFormat
}
