


let resultLog = '[19:06:12.678] [TOD: 20.75] hit - shooterSteamID: "76561199122420355", shooterName: "Jer", shooterFaction: "", shooterPos: "4149.13,3456.50,192.89", targetSteamID: "76561198867646161", targetName: "@PlotSign", targetFaction: "", targetPos: "4141.96,3462.43,191.55", weapon: "Sledgehammer", distance: "9.40", damage: "60.01*1.00x*1.00x*1.00x=60.01", melee: "1", headshot: "0", kill: "0", part: "255(unknown part)", hitType: "sledgehammer", projectile: ""';
let indexIni = resultLog.indexOf('targetSteamID: "');
let indexLast = resultLog.indexOf('", targetName: "@PlotSign"');
indexIni = indexIni + 16;
console.log(resultLog.substring(indexIni, indexLast));

var arrayOfArrays = {};
arrayOfArrays["121212121212"] = { "mail": "ori@gmail.com", "name": "Jer" };
arrayOfArrays["343434343434"] = { "mail": "davin@gmail.com", "name": "Vinxi" };

console.log(arrayOfArrays["121212121212"]);

console.log(arrayOfArrays["121212121212"].mail);

console.log(arrayOfArrays);

const fs = require('fs');

const getBaseMails = () => {
    let baseMailsString = fs.readFileSync('BaseMails.json');
    return JSON.parse(baseMailsString);
};

var saveBaseMails = (baseMails) => {
    fs.writeFileSync('BaseMails.json', JSON.stringify(baseMails));
};

saveBaseMails(arrayOfArrays);
arrayOfArrays["565656565"] = { "mail": "gotic@gmail.com", "name": "Gotic" };
saveBaseMails(arrayOfArrays);

console.log(getBaseMails());
let array = getBaseMails();
console.log(array["565656565"]);
console.log(Object.keys(array).length);

console.log (Math.floor(Date.now()) );
console.log (Math.floor(Date.now() / 1000));