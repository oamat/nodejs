const fs = require('fs');
const csv = require('@fast-csv/parse');
const readline = require('readline');
var arrayOfTypeID = [];
var arrayOfClass = [];


/* ******************************
 * CSV LOAD FUNCTION - https://miscreated.fandom.com/wiki/Basepart_Modding_ID_Registry
 ********************************/
//loadCSV function, generic CSV Loader. https://miscreated.fandom.com/wiki/Basepart_Modding_ID_Registry
const loadCSV = async function (params) {
    return new Promise((resolve, reject) => {
        fs.createReadStream('./AllEntityTypesId.csv')
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); })
            .on('data', row => {
                let type = row[0];
                if (type != null && type != '') {
                    var typeId = parseInt(type);
                    let className = row[1];
                    //console.log(row[0] + ' / ' + typeId + ' int / ' + className) ;                    
                    arrayOfClass[typeId] = className;
                    arrayOfTypeID[className] = typeId;
                    //console.log(`ROW=${JSON.stringify(row)}`)
                }
            }).on('end', rowCount => {
                console.log('\x1b[36m', `Parsed ${rowCount} rows from AllEntityTypesId.csv`);
                resolve(true);
            });
    });
}


/* ******************************
 * COMPARE FUNCTION LINE BY LINE
 ********************************/
async function processLineByLine(fileName) {

    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        // Each line in input will be successively available here as `line`.
        let lineWithTypePos = line.indexOf('type="');
        if (lineWithTypePos > -1) {
            let lineWithType = line.substring(lineWithTypePos, line.length);
            //console.log(lineWithType) ; 
            let arr = lineWithType.split('"');

            if (arr[1] != null && arr[3] != null) {
                let typeID = arr[1]; //typeID of your code
                let entityName = arr[3]; //entityName of your code

                //console.log(typeID + ' : ' + entityName );

                // Compare EntityName with CSV Wikia
                if (arrayOfClass[typeID] != null) {
                    if (entityName != arrayOfClass[typeID]) {
                        console.log('@@@ Found 2 XML with the same typeID but EntityName is different: type="' + typeID + '" -> "name="' + entityName + '" vs "name"="' + arrayOfClass[typeID] + '"');
                        //console.log(line);                    
                    }
                }

                // Compare TypeID with CSV Wikia
                if (arrayOfTypeID[entityName] != null) {
                    if (typeID != arrayOfTypeID[entityName]) {
                        console.log('### Found 2 XML with the same EntityName but typeID is different: "name="' + entityName + '" -> "type"=' + typeID + '" vs "type"=' + arrayOfTypeID[entityName] + '"');
                        //console.log(line);                    
                    }
                }
            } else {
                //console.log(line); //# Query: type="1 # Query: type="2
            }
        }
    }
}


const init = async function () {
    await loadCSV();
    processLineByLine('type_1.code-search');
    processLineByLine('type_2.code-search');
    processLineByLine('type_3.code-search');
    processLineByLine('type_4.code-search');
    processLineByLine('type_5.code-search');
    processLineByLine('type_6.code-search');
    processLineByLine('type_7.code-search');
    processLineByLine('type_8.code-search');
    processLineByLine('type_9.code-search');
}


init();
