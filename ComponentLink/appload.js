
/*  Load Excel into Redis  */
/* 
    Load each relation with Sets (CA <-> SI, SI <-> SN, SN <-> BE, BE <-> DB of all Sheet configured
*/

//LIBRARY CONST
const redis = require("redis");
const xlsxFile = require('read-excel-file/node');

//REDIS INIT
const client = redis.createClient({ host: '192.168.99.100', port: '6379' });

client.on("error", function(error) {
  console.error(error);
});


/* TEST REDIS
client.set("key", "value", redis.print);
client.get("key", redis.print); 
END TEST REDIS*/

//CONST to USE
const toLoad = { 
            CA_SI: { Sheet: 'CA_SI' , ColCA: 0, ColSI: 1 }, 
            SI_SN: { Sheet: 'SI_SN' , ColSI: 0, ColSN: 1 }, 
            SN_BE: { Sheet: 'SN_BE_DB' , ColSN: 0, ColBE: 1 }, 
            BE_DB: { Sheet: 'SN_BE_DB' , ColBE: 1, ColDB: 2 } 
        };
const NORMAL = 'n_';
const REVERSE = 'r_';


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
xlsxFile('./data.xlsx', { sheet: toLoad.CA_SI.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.CA_SI.ColCA] + ' : ' +  rows[i][toLoad.CA_SI.ColSI]  );                    
        client.sadd( NORMAL +rows[i][toLoad.CA_SI.ColCA] , rows[i][toLoad.CA_SI.ColSI] );
        client.sadd( REVERSE + rows[i][toLoad.CA_SI.ColSI], rows[i][toLoad.CA_SI.ColCA] );
        }   
    console.log('\x1b[36m', 'CA - SI Loaded in Redis...');  //cyan log    
 });

 //SI <-> SN, 
 xlsxFile('./data.xlsx', { sheet: toLoad.SI_SN.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.SI_SN.ColCA] + ' : ' +  rows[i][toLoad.SI_SN.ColSI]  );                    
        client.sadd( NORMAL + rows[i][toLoad.SI_SN.ColSI] , rows[i][toLoad.SI_SN.ColSN] );
        client.sadd( REVERSE + rows[i][toLoad.SI_SN.ColSN], rows[i][toLoad.SI_SN.ColSI] );
        }  
    console.log('\x1b[36m', 'SI - SN Loaded in Redis...');  //cyan log        
 });

 // SN <-> BE
 xlsxFile('./data.xlsx', { sheet: toLoad.SN_BE.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.SN_BE.ColCA] + ' : ' +  rows[i][toLoad.SN_BE.ColSI]  );                    
        client.sadd( NORMAL + rows[i][toLoad.SN_BE.ColSN] , rows[i][toLoad.SN_BE.ColBE] );
        client.sadd( REVERSE + rows[i][toLoad.SN_BE.ColBE], rows[i][toLoad.SN_BE.ColSN] );
        }
    console.log('\x1b[36m', 'SN - BE Loaded in Redis...');  //cyan log          
 });
 
 //BE <-> DB 
 xlsxFile('./data.xlsx', { sheet: toLoad.BE_DB.Sheet }).then((rows) => {        
    for (i in rows){    
        // TEST console.log(rows[i][arrayColumnIndex[sheetIndex]]);      
        //console.log('FIND : ' + rows[i][toLoad.BE_DB.ColCA] + ' : ' +  rows[i][toLoad.BE_DB.ColSI]  );                    
        client.sadd( NORMAL +rows[i][toLoad.BE_DB.ColBE] , rows[i][toLoad.BE_DB.ColDB] );
        client.sadd( REVERSE + rows[i][toLoad.BE_DB.ColDB], rows[i][toLoad.BE_DB.ColBE] );
        } 
    console.log('\x1b[36m', 'BE - DB Loaded in Redis...');  //cyan log      
    console.log('\x1b[32m', 'All Components Loaded in Redis (Ctrl - C)');  //green log 
 });


