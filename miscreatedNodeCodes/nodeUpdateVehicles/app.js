
// SQL Lite https://www.sqlitetutorial.net/sqlite-nodejs
//
//ADD this command in ini miscreated script : start_server_core.cmd
//          start /wait <prog> : start /wait node E:/MiscreatedServer/0.customModsUpload/nodeUpdateVehicles/app.js   in start_server_core.cmd
//          Documentation : https://stackoverflow.com/questions/13257571/call-command-vs-start-with-wait-option

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const PATHGAME = "E:/MiscreatedServer/simplifiedMiscreatedServer/MiscreatedServer/";
const SQLLITE_FILE = PATHGAME + "miscreated.db"
const PATHCOLLECTIONS = PATHGAME + "LastShotDB/Data/"
const BASEMAIL_JSON = PATHCOLLECTIONS + "BaseMailCollection.json";
const ABANDONED_TXT = PATHCOLLECTIONS + "abandonedAlert.txt";

var db;

const init = async () => {
    let arrayOfArrays = await getBaseMails(); //load JSON of configured base://it's a Json  key steamid -- {"76561199122420355":{"discordid":"327848104223047680", "mail":"oms@gmail.com","steamid":"76561199122420355","name":"Kawaks","code":"00qc1bn7"}, .... 
    await initDB();
    await selectUpdate();
    await updateVehicleComponents();
    await updateVehiclesPosition();
    await saveBaseAlertsForAbandoned(arrayOfArrays);
    await closeDB();
}



const initDB = async () => {
    // open the database
    db = new sqlite3.Database(SQLLITE_FILE, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the miscreated database.');
    });
    return db;
}


const selectUpdate = async () => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        db.serialize(() => {
            //db.each(`Select * from Vehicles where ClassName IN ('placeholder13','placeholder14','placeholder15','placeholder16','placeholder17','placeholder18','placeholder19','placeholder20','placeholder21')`, (err, row) => {
            db.each(`Select * from Vehicles `, (err, row) => {
                if (err) reject(err);

                //console.log("Update Vehicle id:" + row.VehicleID + " : " + row.Data);  //{"skin":"2612837B","dieselfuel":0,"oil":0}
                /*let json = JSON.parse(row.Data);
                json.dieselfuel = 1000;
                json.oil = 1000; */
                const toAdd = '"dieselfuel":' + getRandomArbitrary(30000, 70000) + ',"oil":' + getRandomArbitrary(2500, 4500) + '}';
                let json = row.Data.substring(0, 19) + toAdd;
                let data = [json, row.VehicleID];
                let sql = `UPDATE Vehicles SET Data = ? WHERE VehicleID=?`;
                db.run(sql, data, function (err) {
                    if (err) reject(err);
                    //console.log(`Row(s) updated: ${this.changes}`);
                    resolve(true);
                });
            });
        });
    });
    //.then(() => { console.log("Select & Update placeholder13-16 done"); resolve(); });
}


const updateVehicleComponents = async () => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `UPDATE Items
    SET Data = '{"count":1,"health":100}'
    WHERE ClassName='CarBattery' 
    or ClassName='SparkPlugs' 
    or ClassName='DriveBelt'
    or ClassName='TowCable';`;

        db.run(sql, function (err) {
            if (err) reject(err);
            console.log('\x1b[32m' , `Component Vehicles Row(s) updated: ${this.changes}`);
            resolve(true);
        });
    });
    //.then(() => { console.log("Select & Update placeholder13-16 done"); resolve(); });
}




const updateVehiclesPosition = async () => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let arrayPos = [[2512, 6680, 62, 0], [1749, 7365, 30, 0], [1688, 7006, 29,], [4158, 3312, 209]]; //Vehicle position  
        let arrayEmptyPos = [];
        let newIndex = 0;
        for (let i = 0; i < arrayPos.length; i++) {
            let empty = await isThePosEmpty(arrayPos[i][0], arrayPos[i][1])
            //console.log("Position Car " + arrayPos[i] + " isEmpty returned:" + empty);
            if (empty) {//we send posx and posy          
                arrayEmptyPos[newIndex] = arrayPos[i];
                newIndex++;
            }
        }

        console.log('\x1b[32m','Vehicle to place ' + newIndex + ' / ' + arrayPos.length);

        if (newIndex != 0) {
            arrayEmptyPos = await getVehiclesToChangePos(arrayEmptyPos);
            for (let i = 0; i < arrayEmptyPos.length; i++) {
                if (arrayEmptyPos[i][3] != 0) {
                    let sql = "update Vehicles SET AbandonTimer=115200, PosX=" + arrayEmptyPos[i][0] + ", PosY=" + arrayEmptyPos[i][1] + ", PosZ=" + arrayEmptyPos[i][2] + " where VehicleID=" + arrayEmptyPos[i][3];
                    //console.log(sql);
                    db.run(sql, function (err) {
                        if (err) reject(err);
                        //console.log(`Row(s) updated: ${this.changes}`);
                    });
                }
            }
        } else resolve();
    });
    //.then(() => { console.log("Select & Update done"); resolve(); });
}


const getVehiclesToChangePos = async (arrayEmptyPos) => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks           
        let index = 0;
        db.serialize(() => {
            db.each(`select * from Vehicles  where ClassName NOT IN ('fishing_boat','jetski', 'party_bus') order by AbandonTimer`, (err, row) => {
                if (err) reject(err);
                if (row) {
                    if (index < arrayEmptyPos.length) {
                        let json = JSON.parse(row.Data);
                        arrayEmptyPos[index][3] = row.VehicleID;
                        //console.log("Insertamos la posición vacia en " + arrayEmptyPos[index]);
                        index++;
                    } else resolve(arrayEmptyPos);
                } else resolve(arrayEmptyPos);
            });
        });
        //.then(() => { console.log("Select Vehicles done"); resolve(); });
        //resolve(arrayEmptyPos);
    });
}


const isThePosEmpty = async (posx, posy) => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        let sql = "select * from Vehicles  where ( PosX between " + (posx - 10) + " AND " + (posx + 10) + " ) AND (PosY between " + (posy - 10) + " AND " + (posy + 10) + ")";
        //console.log(sql);
        //select * from Vehicles  where(PosX between 2500 AND 2525) AND(PosY between 6675 AND 6685)
        //select * from Vehicles  where(PosX between 2500 AND 2525) AND(PosY between 6675 AND 6685)
        //select * from Vehicles  where(PosX between 2500 AND 2525) AND(PosY between 6675 AND 6685)
        db.get(sql, (error, row) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) reject(err);
                else if (row) resolve(false);
                else resolve(true);
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then(() => { console.log("Select Vehicles done"); resolve(); });
}


const closeDB = async () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}


function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


const saveBaseAlertsForAbandoned = async (arrayOfArrays) => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks   
        let index = 0;
        for (let json of Object.values(arrayOfArrays)) { //Iterate values Object            
            if (json.baseID != null) {
                let daysLeft = parseInt(await getDaysLeftBase(json.baseID));
                //console.log(daysLeft);
                if (daysLeft != -1 && daysLeft < 30) {
                    json['daysLeft'] = daysLeft;
                    let data = JSON.stringify(json) + '\n';
                    index++;
                    fs.appendFile(ABANDONED_TXT, data, function (err) {
                        if (err) {
                            console.log('ERROR while write abandonedAlert.txt');
                        } 
                    })
                }
            }
        }
        if ( index > 0 ) console.log('\x1b[33m','Update abandonedAlert.txt with ' + index+ ' alerts.');
        resolve(index);
    });
    //.then(() => { console.log("Select Vehicles done"); resolve(); });
}



const getDaysLeftBase = async (baseID) => {
    return new Promise(async (resolve, reject) => { // we need promise for managing errors and results inside callbacks    
        let sql = "Select AbandonTimer/86400 as daysLeft from Structures where StructureID = " + baseID;
        //console.log(sql);
        db.get(sql, (error, result) => {
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error) reject(err);
                else if (result) resolve(result.daysLeft);
                else resolve(-1);
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then(() => { console.log("Select Vehicles done"); resolve(); });
}


/*******************************
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
    //console.log(data);
    return data;
};


init();