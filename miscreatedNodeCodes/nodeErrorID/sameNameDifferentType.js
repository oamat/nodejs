const fs = require('fs');
const readline = require('readline');
var arrayOfNames=[];
var arrayOfids=[];

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
            let line1 = line.substring(position,line.length);      
            let arr1 = line1.split('"');
            let name1 = arr1[3];
            let id1 = arr1[1];
            if (arrayOfNames[name1] != null){
                let line2 = arrayOfNames[name1];
                let arr2 = line2.split('"');   
                let id2 = arr2[1];
                if (id2 == id1) {
                    //console.log('Found 2 XML with the same name and equal id:' + name1);
                    //console.log(line1);
                    //console.log(line2);
                } else {
                    console.log('###############Found 2 XML with the same name but different id:' + name1 + ' ids : ' + id1 + ' / ' + id2);
                    console.log(line1);
                    console.log(line2);
                }
            } else {
                arrayOfNames[name1] = line1;
                arrayOfids[name1] = id1;
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

