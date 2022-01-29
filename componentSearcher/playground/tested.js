
var array = [];
var json = { c1: 'ca', c2: 'si' }
let str = 'SN';
json['c3'] = str;
str = 'BE';
json['c4'] = str;
str = 'DB';
json['c5'] = str;
array.push(json);
json2 = json;
json2['c5'] = 'new2';
let newjson = JSON.parse(JSON.stringify(json));
newjson['c1'] = 'new';
newjson['c2'] = 'new';
newjson['c3'] = 'new';
newjson['c4'] = 'new';
newjson['c5'] = 'new';

array.push(newjson);
console.table(array);


for (var attributename in json) {
    console.log(attributename + ": " + json[attributename]);
}


const getTestAll = async function () {
    let nextArrayComponents = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    arrayOfArrays.push(nextArrayComponents);
    await recursiveMethod(nextArrayComponents);
}


const recursiveMethod = async function (component, json, index) {
    index = index + 1;  // we add index before for.
    let arrayComponents = await getAllComponents(PREFIX + component); //find components with relationship
    if (arrayComponents.length == 0 || index < FINAL_ITERATES) {
        json['component' + index] = component; //add component to json
        arrayOfArrays.push(json); //add json to global array
    } else {
        let iterator = arrayComponents.values();
        for (let nextComponent of iterator) { //iterate components with relationship
            let cancel = false;
            for (var attribute in json) { //we need to test component don't call the a same component as before
                if (json[attribute] == nextComponent) cancel = true; //if the component is the same we cancel work
            }
            if (cancel) { //cancel the work
                json['component' + index] = component; //add component to json
                arrayOfArrays.push(json); //add json to global array
            } else { //continue work
                recursiveMethod(nextComponent, json, index);
            }
        }
    }
}


async function clone(json) {
    return JSON.parse(JSON.stringify(json));
}


const table = require('table').table;
const fs = require('fs');

let data = [
    ['0A', '0B', '0C'],
    ['1A', '1B', '1C'],
    ['2A', '2B', '2C']
];

let output = table(data);
console.log(output);

fs.writeFile("tabledata.txt", output, "utf8", function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

function toTable(obj) {
    let arr = '';
    arr += '--------------------------\r\n';
    for (let [key, value] of Object.entries(obj[0])) {
        arr += ' ' + key + '\t';
    }
    for (let i = 0; i < obj.length; i++) {
        arr += '\r\n--------------------------\r\n';
        for (let [key, value] of Object.entries(obj[i])) {
            arr += ' ' + value + '\t\t';
        }

    }
    arr += '\r\n--------------------------';
    return arr;
}

const filetable = function (arr) {
    let keys = Object.keys(arr[0]);
    const horizontalLine = '\r\n' + '-'.repeat(180 * keys.length) + '\r\n';
    let heading = Object.keys(arr[0]).join('\t');
    let str = horizontalLine;
    str += heading;
    arr.forEach(function (obj) {
        str += horizontalLine + Object.values(obj).join('\t\t');
    });
    str += horizontalLine;
    console.log(str);
    arr.forEach(s => fs.appendFileSync('tabledata.txt', s));
}

let arr = [
    { firstName: 'Sirwan', lastName: 'Afifi', age: 27 },
    { firstName: 'Person2', lastName: 'P2', age: 32 },
    { firstName: 'Person2', lastName: 'P2', age: 32, firstName1: 'Person2', lastName2: 'P2', age3: 32, firstName3: 'Person2', lastName3: 'P2', age: 32, firstName31: 'Person2', lastName32: 'P2', age33: 32 }
];

filetable(arr);


let inte = 26414154345;
let MAX = 100 / 26;
inte = (inte / 1000000000);
console.log(inte);
console.log(Math.round(inte)* MAX);


var a = "website.old.pepe.ori.html";
var nameSplit = a.split(".");
nameSplit.pop();    
var name = nameSplit.join(".");
console.log(name);


 

if (Object.keys(json).length) {
    console.log('Ple' + json);
}

if (!Object.keys(json).length) {
    console.log('ERROR' + json);
}
let json_empty = {};

if (Object.keys(json_empty).length) {
    console.log(' ERROR ' + json);
}

if (!Object.keys(json_empty).length) {
    console.log('buit' + json);
}


let be = 'TCRPRQ_ListasDaoImpl.selecLisUnica(..)'
console.log(be.indexOf('_'));
be = be.split("_")[0];

console.log(be);
console.log(be.indexOf('.'));



let cost = 4444232323244444444555444;
let costStr = cost.toString();
let costLen = costStr.length;
let Remainder =   costLen % 3;
//console.log( costLen); 
//console.log( Remainder); 
if (Remainder == 0) Remainder = 3;
costStr = costStr.slice(0, Remainder);
//console.log(costStr);
if (costLen < 4) console.log(costStr +'n');
else if (costLen < 7) console.log(costStr +'k');
else if (costLen < 10) console.log(costStr +'M');
else if (costLen < 13) console.log(costStr +'G');
else if (costLen < 16) console.log(costStr +'T');
if (costLen < 19) console.log(costStr +'P');
else console.log(costStr +'**');




const mySet1 = new Set();
mySet1.add("BE.CEFLEX");
mySet1.add("BE.CEFLEX");
mySet1.add("BE.CEFLEX1");
mySet1.add("BE.CEFLEX1");

console.log(mySet1);




for (let item of mySet1) console.log(item);


let component2 = "111111222222222333333Web";
let componentLength = component2.length;
let existWeb = component2.substring(componentLength-3,componentLength);
console.log("existWeb :" + existWeb);
if (existWeb == "Web") component2 = component2.substring(0, componentLength-3);
console.log("trobat :" + component2);

component2 = "PNPE.PNPE111111222222222333333Web";
console.log( component2.substring(0,4));

component2 = "/alertas/altaAlerta/aaa/bbb";
let regex = new RegExp('/', 'g');
component2 = "XMLAPP." + component2.substring(1,component2.length).replace(regex,'.');

console.log( component2);


let component1 = "SI.MCA.AlfabeticPersonaMultiCanal.7.4.3";


component1 = component1.substring(0,component1.indexOf(".",8));
console.log(component1);

component2 = "=>SI.MCA.AlfabeticPersonaMultiCanal.9.3.1=>SN.MCA.AlfabeticPersonaConPersona.4.1.1";
component2 = component2.substring(2,component2.length);
let component2_2 = null
let indexOf2Components = component2.indexOf("=>");
if (indexOf2Components > 0 ) {
    component2_2 = component2.substring(indexOf2Components+2,component2.length);
    component2 = component2.substring(0,indexOf2Components);
    component2 = component2.substring(0,component2.indexOf(".",8));
    component2_2 = component2_2.substring(0,component2_2.indexOf(".",8));
    console.log(component2);
    console.log(component2_2);    
} else {
    component2 = component2.substring(0,component2.indexOf(".",8));
}
console.log(component2);