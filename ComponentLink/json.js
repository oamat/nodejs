var array = [];
var json = { c1: 'ca', c2: 'si' }
let str = 'SN';
json['c3'] = str;
str = 'BE';
json['c4'] = str;
str = 'DB';
json['c5'] = str;
array.push(json);
json2=json;
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

fs.writeFile("tabledata.txt", output,"utf8", function(err) {
    if(err) {
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

const filetable = function(arr) {
        let keys = Object.keys(arr[0]);
        const horizontalLine = '\r\n' + '-'.repeat(180 * keys.length) + '\r\n';
        let heading = Object.keys(arr[0]).join('\t');
        let str = horizontalLine;
        str += heading;
        arr.forEach(function(obj) {
            str += horizontalLine + Object.values(obj).join('\t\t');
        });
        str += horizontalLine;
        console.log(str);
        arr.forEach( s => fs.appendFileSync('tabledata.txt', s));
}

let arr = [
    { firstName: 'Sirwan', lastName: 'Afifi', age: 27 },
    { firstName: 'Person2', lastName: 'P2', age: 32 },
    { firstName: 'Person2', lastName: 'P2', age: 32, firstName1: 'Person2', lastName2: 'P2', age3: 32, firstName3: 'Person2', lastName3: 'P2', age: 32, firstName31: 'Person2', lastName32: 'P2', age33: 32  }
];

filetable(arr);