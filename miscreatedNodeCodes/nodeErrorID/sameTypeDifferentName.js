const fs = require('fs');
const readline = require('readline');
var arrayOfNumbers=[];

async function processLineByLine(fileName) {

    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    for (var i = 0; i < 10000; i++) {             
        var position = line.indexOf('type="'+ i +'"');
        if ( position > -1 )  {
            if (arrayOfNumbers[i] != null) { 
                let position2 = arrayOfNumbers[i].indexOf('type="'+ i +'"');
                let line1 = line.substring(position,line.length);
                let line2 = arrayOfNumbers[i].substring(position2,arrayOfNumbers[i].length);
                let arr1 = line1.split('"');
                let arr2 = line2.split('"');
                let name1 = arr1[3];
                let name2 = arr2[3];
                if (name1==name2){
                    //console.log('Found 2 XML with the same id, but their name are equal:' + name2);        
                } else {
                    console.log('####Found 2 XML with the same id bat name is not Equal:' + name1 + ' / ' +  name2);
                    console.log(line1);
                    console.log(line2);
                }           
            } else {
                arrayOfNumbers[i] = line;
            }
        }
    }
  }
}

processLineByLine('type_1.code-search');
processLineByLine('type_2.code-search');
processLineByLine('type_3.code-search');
processLineByLine('type_4.code-search');
processLineByLine('type_5.code-search');
processLineByLine('type_6.code-search');
processLineByLine('type_7.code-search');
processLineByLine('type_8.code-search');
processLineByLine('type_9.code-search');

