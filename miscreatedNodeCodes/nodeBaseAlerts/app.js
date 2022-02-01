
/*
 * Miscreated Base Alerts 
 *
 * 1. load json file in array
 * 2. cron search last file.
 * 2. tail json file: when change we load again, new occurrence send the welcome email. 
 * 3. tail log file: when change we send email with advise
 */

"use strict";

//DEPENDECIES
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const _ = require('underscore');
const sqlite3 = require('sqlite3').verbose();


var db;
var follow = require('text-file-follower');
//const { min } = require('underscore');


//CONST

const PATHGAME = "E:/MiscreatedServer/simplifiedMiscreatedServer/MiscreatedServer/";
const SQLLITE_FILE = PATHGAME + "miscreated.db"

const PATHLOG = PATHGAME + "logs/";
const PATHCOLLECTIONS = PATHGAME + "LastShotDB/Data/";
const PATTERN = '", targetName: "@PlotSign"';
const PATTERN_INI = 'targetSteamID: "';
const PATTERN_INI_LENGTH = PATTERN_INI.length;
const INTERVAL_CRON = 300000; //5 min. 
const BASEMAIL_JSON = PATHCOLLECTIONS + "BaseMailCollection.json";
const MAILCONFIRM_TXT = PATHCOLLECTIONS + "sendmailcode.txt";
const BASEMAIL_TXT = PATHCOLLECTIONS + "confirmedcode.txt";
const DISCORD_TXT = PATHCOLLECTIONS + "senddiscord.txt";
const ABANDONED_TXT = PATHCOLLECTIONS + "abandonedAlert.txt";
const SENDCODE_TYPE = 0;
const SENDACTIVATED_TYPE = 1;
const SENDRAID_TYPE = 2;
const ABANDONED_TYPE = 3;


//VARS
var damageLogFile;
var cron;
var follower;
var arrayOfArrays = {}; //it's a Json  key steamid -- {"76561199131560355":{"discordid":"3278481045623047680", "mail":"nnn@gmail.com","steamid":"76561196731420355","name":"Kaw","code":"00qc1bn7"}, .... 

var arrayByDiscord = {}; //In mem  key steamid value discordid -- {"327848154223047680":"7656115131420355"}, ....  {steamid:discord}
var arrayOfArraysDiscordTEMP = {}; //in mem key discordid -- {"327848104225047680":{"discordid":"32784854223047680","steamid":"76561155131420355","name":"Kaw"}, .... 
var arrayOfSeconds = {}; //in mem key: steamid
var arrayOfSecondsDiscord = {}; //in mem key discordid



//INIT function
const init = async function () {
    await truncateTXTFiles();
    damageLogFile = await getMostRecentDamageFileName(); //get the most recent damage log file    
    arrayOfArrays = await getBaseMails(); //load JSON of configured mails.
    console.log('\x1b[34m', " Loaded " + Object.keys(arrayOfArrays).length + " configured mails in JSON file: " + BASEMAIL_JSON);
    await loadArrBydiscord(arrayOfArrays);
    console.log('\x1b[34m', " Loaded " + Object.keys(arrayByDiscord).length + " configured discords in previous array.");

    //discord alerts
    connectedToDiscord();
    followSendDiscordTxt();
    //mail alerts
    followAbandonedTxt(); //when we need to send a mail with code
    followSendMailTxt(); //when we need to send a mail with code
    followConfirmedCodeTxt();   //when we need to save info in Array 
    startCron(); //just in case when file change name and date
    followLog();
    console.log('\x1b[34m', 'MISCREATED BASE ALERTS app running...');
}





/******************************
 *  Discorf functions **      
 *****************************/
const connectedToDiscord = async function () {   //when we need to send a mail with code
    console.log('\x1b[32m', "Join to discord...");

    client.on('ready', () => {
        console.log('\x1b[34m', 'Logged in Discord as ' + client.user.tag);
        client.user.setStatus("online");
    });

    //Listen all Messages and Send !ping to BOT
    client.on('message', async (message) => {
        //console.log(message);
        if (message.channel.type === 'dm' && message.content.toUpperCase() === '#OK' && arrayOfArraysDiscordTEMP[message.author.id]) {
            let steamid = arrayOfArraysDiscordTEMP[message.author.id].steamid;
            let name = arrayOfArraysDiscordTEMP[message.author.id].name;
            if (steamid && name) {
                saveArrayOfArrays(arrayOfArraysDiscordTEMP[message.author.id]);
                arrayByDiscord[message.author.id] = steamid;
                message.channel.send(await getActivatedDiscordText(name)); //Confirmation account Channel
                console.log('\x1b[33m', "Discord Activated to player: " + name);
            } else {
                message.channel.send('Player not register on server, please repeat register !setDiscord ID on LastShot.'); //Confirmation account Channel
                console.log('\x1b[31m', "Problem with user Not found after   #OK" + JSON.stringify(arrayOfArraysDiscordTEMP[message.author.id]));
            }
        } else if (message.channel.type === 'dm' && message.content === '#NO' && arrayOfArraysDiscordTEMP[message.author.id]) {
            message.channel.send("DiscordID removed. We will check who and why a player typed your discordID. Thanks"); //NO Confirmation account Channel
            console.log('\x1b[31m', "Problem with user that SAY NO" + JSON.stringify(arrayOfArraysDiscordTEMP[message.author.id]));
        } else if (message.content === '!ping') message.channel.send('Pong.');
    });

    client.login('ODU2ODg1MzY0ODIzOTQ5Mzgz.YNHirw.FAKE_LOGIN');

}

/******************************
 *  Discord Followers ** 
 *****************************/

const followSendDiscordTxt = async function () { //when we need to save info in Array and json 
    console.log('\x1b[32m', "follow " + DISCORD_TXT + " ...");
    follower = follow(DISCORD_TXT);
    follower.on('line', async function (filename, line) {
        console.log('\x1b[32m', '- save and send activated discord: ' + line);
        let json = JSON.parse(line);  // {"steamid":"76561199183354933", "name":"Evo", "discordid":"327848105523047680"}
        arrayOfArraysDiscordTEMP[json.discordid] = json;
        client.users.fetch(json.discordid).then(async (user) => {
            try {
                user.send(await getConfirmationDiscordText(json.name, json.steamid));
                console.log('\x1b[33m', "Discord Confirmation to player: " + json.name);
            } catch (error) { console.log('\x1b[31m', "Problem with Discord ID fake :" + error.message) }

        });
    });
}



/******************************
 *  MAIL Followers functions ** 
 *****************************/





//followSendMailTxt  followSendMailTxt
const followSendMailTxt = async function () {   //when we need to send a mail with code
    console.log('\x1b[32m', "follow " + MAILCONFIRM_TXT + " ...");
    follower = follow(MAILCONFIRM_TXT);
    follower.on('line', async function (filename, line) {
        console.log('\x1b[32m', '- sending confirmation Code: ' + line); //{"name":"Kawaks", "steamid":"76561199551420355", "mail":"dasdsa", "code":"T8wYdJWq"}
        let json = JSON.parse(line);
        sendMail(json, SENDCODE_TYPE);
    });

}


const followConfirmedCodeTxt = async function () { //when we need to save info in Array and json
    console.log('\x1b[32m', "follow " + BASEMAIL_TXT + " ...");
    follower = follow(BASEMAIL_TXT);
    follower.on('line', async function (filename, line) {
        console.log('\x1b[32m', '- save and send activated mail: ' + line);
        let json = JSON.parse(line);
        if (arrayOfArrays[json.steamid]) {
            let baseID = await getBaseID(json.basePosX, json.basePosY);
            arrayOfArrays[json.steamid].mail = json.mail;
            arrayOfArrays[json.steamid].name = json.name;
            arrayOfArrays[json.steamid].steamid = json.steamid;
            arrayOfArrays[json.steamid].baseID = baseID;
        } else { //it doesn't exist, we need to create a new json
            let baseID = await getBaseID(json.basePosX, json.basePosY);
            delete json['basePosX'];
            delete json['basePosY'];
            json['baseID'] = baseID;
            arrayOfArrays[json.steamid] = json;
        }
        saveBaseInfoToJson();
        sendMail(json, SENDACTIVATED_TYPE);
    });
}



/******************************
 *  LOG Followers functions ** 
 *****************************/


//followAbandonedTxt  followAbandonedTxt
const followAbandonedTxt = async function () {   //when we need to send a mail with code
    console.log('\x1b[32m', "follow " + ABANDONED_TXT + " ...");
    follower = follow(ABANDONED_TXT);
    follower.on('line', async function (filename, line) {
        console.log('\x1b[32m', '- sending abandoned Alert: ' + line); //{"mail":"nnn@gmail.com","steamid":"76561195567646161","name":"Jer","code":"emHyn3oo","discordid":"327848105523047680","baseID":776,"daysLeft":27}
        let json = JSON.parse(line);
        //Mail Abandoned Base Alert
        if (json != null && json.mail != null && json.mail.trim() != '') { //exist mail in steamid                        
            sendMail(json, ABANDONED_TYPE);         
        }
        
        if (json != null && json.discordid != null && json.discordid.trim() != '') { //exist mail in steamid
            client.users.fetch(json.discordid).then(async (user) => {
                user.send(await getAbandonedDiscordText(json.name, json.steamid, json.daysLeft));
                console.log('\x1b[33m', "Discord alert for abandoned base : " + json.name + ' -  days left:' + json.daysLeft);
            });
        }
    });
}



//followlog
const followLog = async function () {
    console.log('\x1b[32m', "follow " + PATHLOG + damageLogFile + " ...");
    follower = follow(PATHLOG + damageLogFile);
    follower.on('line', async function (filename, line) {
        let result = line.match(PATTERN);
        if (result) {
            //console.log('\x1b[32m', result);
            let steamid = await getSteamIdBase(result.input);
            let json = arrayOfArrays[steamid];

            //Mail Raid Base Alert
            if (json != null && json.mail != null && json.mail.trim() != '') { //exist mail in steamid
                let before = Number(arrayOfSeconds[steamid]);
                let now = await getSeconds();
                //console.log( before + " / " + now);
                if (before) {
                    if ((now - before) > 1800) {
                        sendMail(json, SENDRAID_TYPE);
                        arrayOfSeconds[steamid] = now;
                    }
                } else {
                    sendMail(json, SENDRAID_TYPE);
                    arrayOfSeconds[steamid] = now;
                }
            }

            //Discord Raid Base alerts, player can get 2 types   
            if (json != null && json.discordid != null && json.discordid.trim() != '') { //exist mail in steamid
                let beforeDiscord = Number(arrayOfSecondsDiscord[json.discordid]);
                let nowDiscord = await getSeconds();
                //console.log( before + " / " + now);
                if (beforeDiscord) {
                    if ((nowDiscord - beforeDiscord) > 1800) {
                        client.users.fetch(json.discordid).then(async (user) => {
                            user.send(await getRaidDiscordText(json.name, steamid));
                            console.log('\x1b[33m', "Discord alert for raid base to player: " + json.name);
                        });
                        arrayOfSecondsDiscord[json.discordid] = nowDiscord;
                    }
                } else {
                    client.users.fetch(json.discordid).then(async (user) => {
                        user.send(await getRaidDiscordText(json.name, steamid));
                        console.log('\x1b[33m', "Discord alert for raid base to player: " + json.name);
                    });
                    arrayOfSecondsDiscord[json.discordid] = nowDiscord;
                }
            }
        }
    });
}

const getSteamIdBase = async function (resultLog) {  //[19:06:12.678] [TOD: 20.75] hit - shooterSteamID: "76561199551420355", shooterName: "Jer", shooterFaction: "", shooterPos: "4149.13,3456.50,192.89", targetSteamID: "76561195567646161", targetName: "@PlotSign", targetFaction: "", targetPos: "4141.96,3462.43,191.55", weapon: "Sledgehammer", distance: "9.40", damage: "60.01*1.00x*1.00x*1.00x=60.01", melee: "1", headshot: "0", kill: "0", part: "255(unknown part)", hitType: "sledgehammer", projectile: ""
    let indexIni = resultLog.indexOf(PATTERN_INI);
    let indexLast = resultLog.indexOf(PATTERN);
    indexIni = indexIni + PATTERN_INI_LENGTH;
    return resultLog.substring(indexIni, indexLast);
}

const getSeconds = async function () {
    return Math.floor(Date.now() / 1000)
}




/******************************
 *  BBDD functions ** 
 *****************************/

const getBaseID = async function (posX, posY) {
    await initDB();  //READONLY       
    let id = await getDBBaseID(posX, posY);
    await closeDB();
    return id;
}


const getDBBaseID = async (posx, posy) => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        let sql = "select StructureID FROM Structures where ( PosX between " + (posx - 5) + " AND " + (posx + 5) + " ) AND (PosY between " + (posy - 5) + " AND " + (posy + 5) + ")";
        //console.log(sql);
        //Select StructureID FROM Structures where ( PosX between 4652.49  AND 4672.49 ) AND (PosY between 7063.16 AND 7083.16 )
        db.get(sql, (error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) reject(err);
                else if (result) resolve(result.StructureID);
                else resolve(-1);
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then(() => { console.log("Select Vehicles done"); resolve(); });
}


const initDB = async () => {
    // open the database
    db = new sqlite3.Database(SQLLITE_FILE, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the miscreated database.');
    });
    return db;
}

const closeDB = async () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

/******************************
 *  Mail Sender functions ** 
 *****************************/

// async..await is not allowed in global scope, must use a wrapper
const sendMail = async function (json, type) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //console.log('\x1b[32m','mail send');

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", //smtp.gmail.com" // https://developers.google.com/gmail/imap/imap-smtp
        port: 587, //Use port 465, or port 587 if your client begins with plain text before issuing the STARTTLS command.
        secure: false, // true for 465, false for other ports
        auth: {
            user: "lastshotbcn@gmail.com", // generated ethereal user
            pass: "CCCCCC", // generated ethereal password
        },
    });

    if (type == SENDCODE_TYPE) {
        let info = await transporter.sendMail({
            from: '"🅻🅰🆂🆃🆂🅷🅾🆃 🅱🅲🅽  🎮" <Lastshotbcn@gmail.com>', // sender address
            to: json.mail, // list of receivers
            subject: "Please confirm your e-mail address ✔", // Subject line
            text: await getCodeMailText(json.name, json.steamid, json.code), // plain text body
            html: await getCodeMail(json.name, json.steamid, json.code), // html body
        });
        console.log('\x1b[32m', "Mail confirm code to player: " + json.name, info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        //console.log('\x1b[32m',"Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    } else if (type == SENDACTIVATED_TYPE) {
        let info = await transporter.sendMail({
            from: '"🅻🅰🆂🆃🆂🅷🅾🆃 🅱🅲🅽  🎮" <Lastshotbcn@gmail.com>', // sender address
            to: json.mail, // list of receivers
            subject: "Base Alerts activated to this mail ✔", // Subject line            
            text: await getActivatedMailText(json.name, json.steamid), // plain text body
            html: await getActivatedMail(json.name, json.steamid), // html body
        });
        console.log('\x1b[32m', "Mail alerts Activated to player: " + json.name, info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        //console.log('\x1b[32m',"Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    } else if (type == SENDRAID_TYPE) {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"🅻🅰🆂🆃🆂🅷🅾🆃 🅱🅲🅽  🎮" <Lastshotbcn@gmail.com>', // sender address
            to: json.mail, // list of receivers
            subject: "Base under attack, protect your crates! ✔", // Subject line
            text: await getRaidMailText(json.name, json.steamid), // plain text body
            html: await getRaidMail(json.name, json.steamid), // html body
        });
        console.log('\x1b[32m', "Mail raid alert to player: " + json.name, info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        //console.log('\x1b[32m',"Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } else if (type == ABANDONED_TYPE) {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"🅻🅰🆂🆃🆂🅷🅾🆃 🅱🅲🅽  🎮" <Lastshotbcn@gmail.com>', // sender address
            to: json.mail, // list of receivers
            subject: "Your base will be removed from the server in " + json.daysLeft + " days ✔", // Subject line
            text: await getAbandonedMailText(json.name, json.steamid, json.daysLeft), // plain text body
            html: await getAbandonedMail(json.name, json.steamid, json.daysLeft), // html body
        });
        console.log('\x1b[32m', "Mail Abandoned alert to player: " + json.name, info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        //console.log('\x1b[32m',"Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...        
    } else {
        console.log('\x1b[32m', "we cannot send any mail because type don't exist.")
    }

}


/******************************
 *  cron functions ** 
 *****************************/
const startCron = async () => { //Start cron only when cron is stopped.
    try {
        console.log('\x1b[34m', "Initializing cronMain with interval : " + INTERVAL_CRON);
        if (cron) {
            console.log('\x1b[32m', "CronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(async () => {
                //console.log('\x1b[32m'," Cron executing ...");
                let newDamageLogFile = await getMostRecentDamageFileName(PATHLOG);
                if (newDamageLogFile)
                    if (damageLogFile != newDamageLogFile) {
                        damageLogFile = newDamageLogFile;
                        console.log('\x1b[32m', " change file ..." + newDamageLogFile);
                        follower.close();
                        followLog();
                    }
            }, INTERVAL_CRON);
        }
    } catch (error) {
        console.log('\x1b[33m', "ERROR: we cannot start BATCHSMS cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}


// Return the name of the damage log that we need to check with tail
const getMostRecentDamageFileName = async function () {
    let allFiles = fs.readdirSync(PATHLOG);
    let damageLogFiles = _.filter(allFiles, file => { //filter: we only want the damage log
        if (file.substring(0, 10) == "damagelog_") return true
        else return false;
    });

    let lastdamageLogFile = _.max(damageLogFiles, file => {
        let fullpath = path.join(PATHLOG, file);
        return fs.statSync(fullpath).ctime;
    });

    return lastdamageLogFile;
}

/******************************
 *  json file functions ** 
 *****************************/
const getBaseMails = async () => {
    //console.log('\x1b[32m', "load " + BASEMAIL_JSON + " in arrayOfArrays");
    let data;
    try {
        let rawData = fs.readFileSync(BASEMAIL_JSON);
        data = JSON.parse(rawData);
    } catch (error) {
        console.log('\x1b[33m', "ERROR loading " + BASEMAIL_JSON + " return {}" + error);
        data = {};
    }
    console.log(data);
    return data;
};


const saveBaseInfoToJson = async () => {
    console.log('\x1b[32m', "save arrayOfArrays in " + BASEMAIL_JSON);
    fs.writeFileSync(BASEMAIL_JSON, JSON.stringify(arrayOfArrays));
};

const loadArrBydiscord = async (array) => {
    if (Object.keys(array).length > 0)
        for (const [key, value] of Object.entries(array)) {
            //console.log(key + " : " + value.discordid);
            arrayByDiscord[value.discordid] = key;
        }
}

const saveArrayOfArrays = async (json) => {
    console.log(json);
    if (arrayOfArrays[json.steamid]) {
        let baseID = await getBaseID(json.basePosX, json.basePosY);
        arrayOfArrays[json.steamid].discordid = json.discordid;
        arrayOfArrays[json.steamid].name = json.name;
        arrayOfArrays[json.steamid].steamid = json.steamid;
        arrayOfArrays[json.steamid].baseID = baseID;
    } else { //it doesn't exist, we need to create a new json
        let baseID = await getBaseID(json.basePosX, json.basePosY);
        delete json['basePosX'];
        delete json['basePosY'];
        json['baseID'] = baseID;
        arrayOfArrays[json.steamid] = json;
    }
    console.log(arrayOfArrays[json.steamid]);
    saveBaseInfoToJson(); //save json
    return;
}

const truncateTXTFiles = async () => {
    const fs = require('fs')
    fs.truncate(MAILCONFIRM_TXT, 0, function(){return;});
    fs.truncate(BASEMAIL_TXT, 0, function(){return;});
    fs.truncate(DISCORD_TXT, 0, function(){return;});
    fs.truncate(ABANDONED_TXT, 0, function(){return;});
    console.log('\x1b[34m', "Initializing files: all txt alerts files have been truncated before starting process.");
    return;
}

/******************************
 *  Mail composite functions ** 
 *****************************/
const getCodeMail = async (player, steamid, code) => {
    let codeMail = '<h3>Hi ' + player + ',</h3><h3>Here is the code you need to activated base alerts on LastShotBCN Miscreated Server:</h3><p style="font-size: 1.5em;">Your confirm code is <span style="background-color: #ff9900;"><strong style="padding: 0px 5px; color: #ffffff;">';
    codeMail = codeMail + code + '</strong></span>&nbsp;, you can type <span style="background-color: #ff9900;"><strong style="padding: 0px 5px; color: #ffffff;"> !confirmMail ';
    codeMail = codeMail + code + '</strong></span>&nbsp;in the chat command of LastShotBCN server or copy &amp; paste directly.</p><h4><em>The confimation code is required to complete the Base Alert feature on LastShotBCN.</em></h4><h4><em>This email was generated because player ';
    codeMail = codeMail + player + ' with steam account : <a href="https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '">https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '</a> wants to receive miscreated game alerts to this email.&nbsp;</em><em>If you are not the player to join on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.&nbsp;&nbsp; </em></h4>';
    codeMail = codeMail + '<h4><span style="background-color: #ff9900;"><em>Cheers,&nbsp;</em></span><span style="background-color: #ff9900;"><em>LastShotBCN Team</em></span></h4>';
    //console.log(codeMail);
    return codeMail;
}

const getCodeMailText = async (player, steamid, code) => {
    let codeMail = 'Hi ' + player + '\nHere is the code you need to activated base alerts on LastShotBCN Miscreated Server:\nYour confirm code is';
    codeMail = codeMail + code + ' , you can type !confirmMail ';
    codeMail = codeMail + code + ' in the chat command of LastShotBCN server or copy & paste directly. The confimation code is required to complete the Base Alert feature on LastShotBCN.\nThis email was generated because player ';
    codeMail = codeMail + player + ' with steam account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + ' wants to receive miscreated game alerts to this email. If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.\n';
    codeMail = codeMail + '\nCheers, LastShotBCN Team.';
    //console.log(codeMail);
    return codeMail;
}

const getRaidMail = async (player, steamid) => {
    let codeMail = '<h3>Hi ' + player + '</h3><h3><span style="background-color: #ff9900;"><em>Your base is under attack!</em></span> This is an alert because some Miscreated player is trying to raid your base (next alert in 30min.); The base belongs to this steam user account: <a href="https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '">https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '</a> .<h4><em>&nbsp;</em><em>This email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive&nbsp;</em><em>LastShotBCN B</em><em>ase Alerts to this mail.&nbsp;</em><em>If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.&nbsp;&nbsp; </em></h4>';
    codeMail = codeMail + '<h4><span style="background-color: #ff9900;"><em>Cheers,&nbsp;</em></span><span style="background-color: #ff9900;"><em>LastShotBCN Team</em></span></h4>';
    //console.log(codeMail);
    return codeMail;
}

const getRaidMailText = async (player, steamid) => {
    let codeMail = 'Hi ' + player + ',\nYour base is under attack! This is an alert because some Miscreated player is trying to raid your base (next alert in 30min.); The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '. \nThis email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive LastShotBCN Base Alerts to this mail. If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.';
    codeMail = codeMail + 'Cheers, LastShotBCN Team.';
    //console.log(codeMail);
    return codeMail;
}


const getAbandonedMail = async (player, steamid, daysLeft) => {
    let codeMail = '<h3>Hi ' + player + '</h3><h3><span style="background-color: #ff9900;"><em>YYour base will be removed from the server in ' + daysLeft + ' days.</em></span>. The base belongs to this steam user account: <a href="https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '">https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '</a> .<h4><em>&nbsp;</em><em>This email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive&nbsp;</em><em>LastShotBCN B</em><em>ase Alerts to this mail.&nbsp;</em><em>If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.&nbsp;&nbsp; </em></h4>';
    codeMail = codeMail + '<h4><span style="background-color: #ff9900;"><em>Cheers,&nbsp;</em></span><span style="background-color: #ff9900;"><em>LastShotBCN Team</em></span></h4>';
    //console.log(codeMail);
    return codeMail;
}

const getAbandonedMailText = async (player, steamid, daysLeft) => {
    let codeMail = 'Hi ' + player + ',\nYour base will be removed from the server in ' + daysLeft + ' days. The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '. \nThis email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive LastShotBCN Base Alerts to this mail. If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.';
    codeMail = codeMail + 'Cheers, LastShotBCN Team.';
    //console.log(codeMail);
    return codeMail;
}

const getActivatedMail = async (player, steamid) => {
    let codeMail = '<h3>Hi ' + player + '</h3><h3><span style="background-color: #ff9900;"><strong>Base alerts on your base have been activated</strong>;</span> The base belongs to this steam user account: <a href="https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '">https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '</a> .<h4><em>This email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive&nbsp;</em><em>LastShotBCN Base Alerts to this mail.&nbsp;If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.&nbsp;&nbsp; </em></h4>';
    codeMail = codeMail + '<h4><span style="background-color: #ff9900;"><em>Cheers,&nbsp;</em></span><span style="background-color: #ff9900;"><em>LastShotBCN Team</em></span></h4>';
    //console.log(codeMail);
    return codeMail;
}

const getActivatedMailText = async (player, steamid) => {
    let codeMail = 'Hi ' + player + '\nBase alerts on your base have been activated. The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + '. \nThis email was generated because the player ';
    codeMail = codeMail + player + ' wants to receive LastShotBCN Base Alerts to this mail. If you are not the player who joined on LastShotBCN then please reply this mail, and we will consider bann player and delete this email address from our servers to ensure your account security.';
    codeMail = codeMail + 'Cheers, LastShotBCN Team.';
    //console.log(codeMail);
    return codeMail;
}


/******************************
 *  Discord Text functions ** 
 *****************************/

const getConfirmationDiscordText = async (player) => {
    let codeMail = 'Hi ' + player + ', a confimation account is required to complete the Base Alert feature on LastShotBCN.**Please, type #OK for confirmation.**\n';
    codeMail = codeMail + '*If you are not the player who joined on LastShotBCN then please reply #NO, and we will consider bann player and delete this discord addressID from our servers to ensure your account security.*';
    return codeMail;
}

const getActivatedDiscordText = async (player) => {
    let codeMail = 'Hi ' + player + ', **Base alerts on your discord account have been activated**. Good luck on LastShot.';
    return codeMail;
}

const getRaidDiscordText = async (player, steamid) => {
    let codeMail = 'Hi ' + player + ', **Your base is under attack! Protect your crates** . *This is an alert because some Miscreated player is trying to raid your base (next alert in 30min.); The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + ' .*';
    return codeMail;
}

const getAbandonedDiscordText = async (player, steamid, daysLeft) => {
    let codeMail = 'Hi ' + player + ', **Your base will be removed from the server in ' + daysLeft + ' days** . *Please join on LastShotBCN Miscreated server and reactivate your base - days left: ' + daysLeft + '. The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + ' .*';
    return codeMail;
}




/******************************
 *  init functions ** 
 *****************************/
init();