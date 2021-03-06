const fs = require('fs');
const readline = require('readline');
const batchFolder = "./files";
const lineCounter = ((i = 0) => () => ++i)();

console.log(" Print all files of folder 'files' : ");

fs.readdirSync(batchFolder).forEach(file => {
    console.log(file);
});

console.log(" -> ");
console.log(" *********************************** ");
console.log(" Print a value fileBatch.notifications[1].message of 'file1.json' : ");

var file1 = fs.readFileSync('./files/file1.json');
var jsonFile = JSON.parse(file1);
console.log(jsonFile.fileBatch.notifications[1].message);


console.log(" -> ");
console.log(" *********************************** ");
console.log(" Print all lines of 'file1.json' : ");

var lineReader = readline.createInterface({
    input: fs.createReadStream('./files/file1.json')
});

lineReader.on('line', function (line, lineNum = lineCounter() ) {    
    setTimeout( () => { console.log('Line [' + lineNum + '] from file:', line); }, 100);
});

lineReader.on('close', function () {
    console.log(' file close automatically at the end..');
});

