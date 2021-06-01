
/*  Load Excel into Redis  */
/* 
    Load each relation with Sets (CA <-> SI, SI <-> SN, SN <-> BE, BE <-> DB of all Sheet configured
*/

//DEPENDENCIES LIBRARY CONST
const redis = require("redis");
const fs = require('fs');
const csv = require('@fast-csv/parse');
const { endianness } = require("os");
 

//CONST to USE
const toLoad = { 
    CA_CA: { doc: 'UnificacionInterface_AC_X_AC.csv' , Col1: 0,  Col2: 1, Col3: 2, Col4: 3 },        
    CA_SI: { doc: 'UnificacionInterface_SI_X_AC.csv' , Col1: 0,  Col2: 1, Col3: 3, Col4: 4 }, 
    SI_SI: { doc: 'UnificacionInterface_SI_X_SI.csv' , Col1: 0,  Col2: 1, Col3: 3, Col4: 4 },
    SI_SN: { doc: 'UnificacionInterface_SN_X_SI.csv' , Col1: 0,  Col2: 1, Col3: 3, Col4: 4 },
    SI_SNBE: { doc: 'UnificacionInterface_SI_X_SNBE.csv' , Col1: 0,  Col2: 1, Col3: 3, Col4: 4, Col5: 6 },
    SNBE_SNBE: { doc: 'UnificacionInterface_SNBE_X_SNBE.csv' , Col1: 2,  Col2: 2, Col3: 0 },
    SNBE_BE: { doc: 'UnificacionInterface_BE_X_SNBE.csv' , Col1: 2,  Col2: 0},
    SN_SA: { doc: 'UnificacionInterface_SN_X_SA.csv' , Col1: 1,  Col2: 0 }   
};

const PATH = './xlsx/';
const NORMAL = 'n_';
const REVERSE = 'r_';
const NORMAL_CA = 'nc_';
const REVERSE_CA = 'rc_';


//REDIS INIT
const client = redis.createClient({ host: '192.168.99.100', port: '6379' });

client.on("error", function(error) {
  console.error(error);
});


/* TEST REDIS
client.set("key", "value", redis.print);
client.get("key", redis.print); 
END TEST REDIS*/



const init = async function () {
    await loadCSV_CA(toLoad.CA_CA);  
    await loadCSV(toLoad.CA_SI);  
    await loadCSV(toLoad.SI_SI);      
    await loadCSV(toLoad.SI_SN);  
    await loadCSV_SNBE(toLoad.SI_SNBE);  
    await loadCSV_2SNBE(toLoad.SNBE_SNBE);  
    await loadCSV_BE(toLoad.SNBE_BE);  
    await loadCSV_SA(toLoad.SN_SA);                                                                               
}


const loadCSV = async function (params) {
    fs.createReadStream(PATH + params.doc)
        .pipe(csv.parse({ delimiter: ';' }))
        .on('error', error => console.error(error))
        .on('data', row => {
            let component1 = row[params.Col1] + '.' + row[params.Col2];
            let component2 = row[params.Col3] + '.' + row[params.Col4];            
            if (component1 != component2) {
                client.sadd(NORMAL + component1, component2);
                client.sadd(REVERSE + component2, component1);
            }
            //console.log(`ROW=${JSON.stringify(row)}`)
        })
        .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
    }


     const loadCSV_CA = async function (params) {
        fs.createReadStream(PATH+params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => console.error(error))
            .on('data', row => {
                let component1 = row[params.Col1]+'.'+row[params.Col2];
                let component2 = row[params.Col3]+'.'+row[params.Col4];
                if (component1 != component2 ) {
                    client.sadd( NORMAL_CA + component1, component2 );
                    client.sadd( REVERSE_CA + component2, component1);
                }
                //console.log(`ROW=${JSON.stringify(row)}`)
            })
            .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
        }

        

const loadCSV_SNBE = async function (params) {
        fs.createReadStream(PATH+params.doc)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => console.error(error))
            .on('data', row => {                
                let component1 = row[params.Col1]+'.'+row[params.Col2];
                let component2 = row[params.Col3]+'.'+row[params.Col4];                
                let component3 = 'BE.'+row[params.Col5];
                client.sadd( NORMAL + component1, component2 );
                client.sadd( REVERSE + component2, component1);
                client.sadd( NORMAL + component2, component3);
                client.sadd( REVERSE + component3, component2);                
                //console.log(`ROW=${JSON.stringify(row)}`)
            })
            .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
        }


        const loadCSV_2SNBE = async function (params) {
            fs.createReadStream(PATH+params.doc)
                .pipe(csv.parse({ delimiter: ';' }))
                .on('error', error => console.error(error))
                .on('data', row => {
                    let component1 = 'SNBE.'+row[params.Col1];
                    let component2 = 'SNBE.'+row[params.Col2];            
                    let component3 = 'BE.'+row[params.Col3];
                    client.sadd( NORMAL + component1, component2 );
                    client.sadd( REVERSE + component2, component1);
                    client.sadd( NORMAL + component2, component3);
                    client.sadd( REVERSE + component3, component2);
                    
                    //console.log(`ROW=${JSON.stringify(row)}`)
                })
                .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
            }
    

    const loadCSV_BE = async function (params) {
            fs.createReadStream(PATH+params.doc)
                .pipe(csv.parse({ delimiter: ';' }))
                .on('error', error => console.error(error))
                .on('data', row => {                    
                    let component1 = 'SNBE.'+row[params.Col1];
                    let component2 = 'BE.'+row[params.Col2];
                    client.sadd( NORMAL + component1, component2 );
                    client.sadd( REVERSE + component2, component1);                    
                    //console.log(`ROW=${JSON.stringify(row)}`)
                })
                .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
            }
    

            const loadCSV_SA = async function (params) {
                fs.createReadStream(PATH+params.doc)
                    .pipe(csv.parse({ delimiter: ';' }))
                    .on('error', error => console.error(error))
                    .on('data', row => {                    
                        let component1 = 'SN.'+row[params.Col1];
                        let component2 = 'SA.'+row[params.Col2];
                        client.sadd( NORMAL + component1, component2 );
                        client.sadd( REVERSE + component2, component1);                    
                        //console.log(`ROW=${JSON.stringify(row)}`)
                    })
                    .on('end', rowCount => console.log('\x1b[32m', `Parsed ${rowCount} rows from ${params.doc}`));
                }
        




/*  TEST read-excel-file/node
//LOAD EXCEL (SAME FILE)  // https://javascript.plainenglish.io/how-to-read-an-excel-file-in-node-js-6e669e9a3ce1
xlsxFile('./data.xlsx', { sheet: arraySheets[sheetIndex] }).then((rows) => {
    console.log(rows); //TEST SHEET rows
    console.table(rows); //TEST SHEET rows 

    for (i in rows){
        for (j in rows[i]){
            console.log(rows[i][j]);                          
        }
    }  
   
   rows.forEach((col)=>{
        col.forEach((data)=>{
          console.log(data);          
          console.log(typeof data);
        })
    }) 

*/ //END TEST read-excel-file/node
       
           

//LOAD EXCEL (SAME FILE)  // https://javascript.plainenglish.io/how-to-read-an-excel-file-in-node-js-6e669e9a3ce1
//CA <-> SI

/* xlsxFile(fs.createReadStream('./xlsx/CA_SI.xlsx', { sheet: toLoad.CA_SI.Sheet })).then((rows) => {      
    try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
        for (i in rows){    
            // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);                  
            let component1 =  rows[i][toLoad.CA_SI.ColCA] +'.'+ rows[i][toLoad.CA_SI.ColCAx]; 
            let component2 =  rows[i][toLoad.CA_SI.ColSI]+'.'+rows[i][toLoad.CA_SI.ColSIx];
            //console.log('FIND : ' + component1 + ' : ' +  component2  );              
            client.sadd( NORMAL + component1, component2 );
            client.sadd( REVERSE + component2, component1);
            }   
        console.log('\x1b[32m', 'CA - SI Loaded in Redis...');  //cyan log    
    } catch (error) { console.log(error); } // In Callback we need to reject
 }); */

 /* //SI <-> SN, 
 xlsxFile('./data.xlsx', { sheet: toLoad.SI_SN.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.SI_SN.ColCA] + ' : ' +  rows[i][toLoad.SI_SN.ColSI]  );                    
        client.sadd( NORMAL + rows[i][toLoad.SI_SN.ColSI] , rows[i][toLoad.SI_SN.ColSN] );
        client.sadd( REVERSE + rows[i][toLoad.SI_SN.ColSN], rows[i][toLoad.SI_SN.ColSI] );
        }  
    console.log('\x1b[32m', 'SI - SN Loaded in Redis...');  //cyan log        
 });

 // SN <-> BE
 xlsxFile('./data.xlsx', { sheet: toLoad.SN_BE.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.SN_BE.ColCA] + ' : ' +  rows[i][toLoad.SN_BE.ColSI]  );                    
        client.sadd( NORMAL + rows[i][toLoad.SN_BE.ColSN] , rows[i][toLoad.SN_BE.ColBE] );
        client.sadd( REVERSE + rows[i][toLoad.SN_BE.ColBE], rows[i][toLoad.SN_BE.ColSN] );
        }
    console.log('\x1b[32m', 'SN - BE Loaded in Redis...');  //cyan log          
 });
 
 //BE <-> DB 
 xlsxFile('./data.xlsx', { sheet: toLoad.BE_DB.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.BE_DB.ColCA] + ' : ' +  rows[i][toLoad.BE_DB.ColSI]  );                    
        client.sadd( NORMAL +rows[i][toLoad.BE_DB.ColBE] , rows[i][toLoad.BE_DB.ColDB] );
        client.sadd( REVERSE + rows[i][toLoad.BE_DB.ColDB], rows[i][toLoad.BE_DB.ColBE] );
        } 
    console.log('\x1b[32m', 'BE - DB Loaded in Redis...');  //cyan log      
    console.log('\x1b[32m', 'All Components Loaded in Redis (Ctrl - C)');  //green log 
 });
 */


 init();