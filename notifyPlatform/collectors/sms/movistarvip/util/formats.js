/*
 * formats util class for notify platform: we don't use async functions in this class 
 *        because this methods always return values, they haven't asyncronous methods inside, and we need return a value inmediately, not promises as a async function. 
 *
 */

//Variables

const SMS = "SMS.";
const PNS = "PNS.";

//methods to expose

//Replace all 3 types of line breaks with a space
const replaceBreaks = (someText) => {
   return someText.replace(/(\r\n|\n|\r)/gm, " ");
}

//Replace all double white spaces with single spaces
const replaceSpacesTo1 = (someText) => {
   return someText.replace(/\s+/g, " ");
}

//Replace all single spaces for no space.
const replaceSpaces = (someText) => {
   return someText.replace(/\s+/g, "");
}


//Date format for printing undertand date
const dateFormat = (date) => {
   return date.toLocaleString();
   //return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

//Date format for printing undertand date
const dateFormatWithMillis = (date) => { //only for smsStauts/pnsStatus
   return date.toLocaleString() + "." + date.getMilliseconds();
}

const logTime = (date) => {
   return ("[" + date.toLocaleTimeString() + "." + date.getMilliseconds() + "] ");

}
//build the name of SMS channel with operator and priority, we neeed it for redis. 
const buildSMSChannel = (operator, priority) => {
   return SMS + operator + "." + priority;
}

//build the name of all SMS channels with operator and priority, we neeed it for redis. 
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

//build the name of PNS channel with operator and priority, we neeed it for redis. 
const buildPNSChannel = (operator, priority) => {
   return PNS + operator + "." + priority;
}

//build the name of all PNS channels with operator and priority, we neeed it for redis. 
const buildPNSChannels = (operator) => {
   return {
      channel0: buildPNSChannel(operator, 0),
      channel1: buildPNSChannel(operator, 1),
      channel2: buildPNSChannel(operator, 2),
      channel3: buildPNSChannel(operator, 3),
      channel4: buildPNSChannel(operator, 4),
      channel5: buildPNSChannel(operator, 5)
   }
}

const counter = ((i = 0) => () => ++i)();

const descStatus = (type, status) => { //0:notSent, 1:Sent, 2:Confirmed, 3:retry, 4:Expired, 5:Error service or token not found(not register)
   switch (status) {
      case 0:
         return type + " not send.";
      case 1:
         return type + " sent.";
      case 2:
         return type + " sent and confirmed by operator.";
      case 3:
         return type + " obtain an error. We will try to send again.";
      case 4:
         return type + " has expired and has not been sent.";
      case 5:
         return type + " obtain an error and is not valid, we cannot find token or operator service. we cannot try again."; //only PNS. 
   }
}

const validateOperator = (type, operator) => {
   if (type == "SMS") {
      if (operator == "MOV" || operator == "ORA" || operator == "VIP" || operator == "VOD" || operator == "ALL")
         return true;
   } else if (type == "PNS") {
      if (operator == "APP" || operator == "GOO" || operator == "MIC" || operator == "ALL")
         return true;
   }
   return false;
}


const validateInterface = (interface) => {
   if (interface == "REST" || interface == "BATCH" || interface == "MQ" || interface == "ALL") return true;
   else return false;
}

const validatePermission = (permission) => {
   if (permission == "THIS" || permission == "WITHIN_APP" || permission == "ALL") return true;
   else return false;
}

module.exports = {
   dateFormat, dateFormatWithMillis, logTime, buildSMSChannel, buildSMSChannels, buildPNSChannel,
   buildPNSChannels, counter, replaceBreaks, replaceSpacesTo1, replaceSpaces, descStatus,
   validateOperator, validateInterface, validatePermission
}
