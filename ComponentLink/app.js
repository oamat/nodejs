
"use strict";

/*  FIND RELATIONS
Prepare Excel without Repetitions. 
With type, component and order we need and array of arrays like that : 
    arrayOfArrays.push({ CA: 'CA.OFI.Component4' , SI: 'SI.MCA.Component4' , SN: 'SN.MCA.Component6', BE: 'BE.DECDEC', DB: 'DECO02P' });  https://stackoverflow.com/questions/45331972/nodejs-how-can-i-create-multidimensional-array

0. Ask Arguments:
    Type of initial component : (CA, SI, SN, BE or DB) :    
    Name of Component : e.g. CA.OFI.Component    
    Search Order:  "CA -> SI -> SN -> BE -> DB" or "DB -> BE -> SN -> SI -> CA"  :  true or false 
        if true  : normal determine the sheet to search -> CA: always 0, SI:1 , SN:2, BE:3 , DB: always 3 (error)  
        if false : invers determine the sheet to search -> CA: always 3 (error), SI:3 , SN:2, BE:1 , DB: always 0  
    *With this info we have to know the sheets we need 
    
    
1. find the relations with component with SMEMBERS
2. When we find we execute all pushes in arrayOfArrays
3. Continue search next component. 
4. 

*/


//DEPENDENCIES
const redis = require("redis");
const prompts = require('prompts');

//REDIS CONFIG & INIT
const client = redis.createClient({ host: '192.168.99.100', port: '6379' });

client.on("error", function(error) {
  console.error(error);
});


/* TEST REDIS
client.set("key", "value", redis.print);
client.get("key", redis.print); 
END TEST REDIS*/




//ARGUMENTS
const response = {};
var order = true;
var type = 'CA';
var component = 'CA14';
var PREFIX;



//vars
var arrayOfArrays = [];


// method getResponse async, for get the user response before searching.
const getResponse = async () => {

    response.type= (await prompts({
        type: 'select',
        name: 'value',
        message: 'Choose component type',
        choices: [
          { title: 'CA', value: 'CA' },
          { title: 'SI', value: 'SI' },
          { title: 'SN', value: 'SN' },
          { title: 'BE', value: 'BE' },
          { title: 'DB', value: 'DB' },
        ],
        initial: 0
      })).value;

    response.component = (await prompts({
        type: 'text',
        name: 'value',
        message: 'Component to search? '     
    })).value;

    response.order= (await prompts({
        type: 'select',
        name: 'value',
        message: 'Choose direction',
        choices: [
          { title: 'Normal: CA->SI->SN->BE->DB', value: true },
          { title: 'Reverse: DB->BE->SN->SI->CA', value: false },
        ],
        initial: 0
      })).value;  

}





const getAllComponents = async function (component) {
    return new Promise((resolve, reject) => {
        client.smembers(component, (error, result) => { //get result or error
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                if (error) throw error;  //if redis give me an error. 
                else if (result) resolve(result); // everything is OK, return result
                else throw new Error('Error: we didn\'t get values …');   
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
            //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
        //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here.
}

const init = async function () {
    await  getResponse();
    console.log(response);
    order = response.order;
    PREFIX = order?'n_':'r_';
    component = response.component;
    type = response.type;
    await getAllRelations();

   /*  if (order) {
        switch (type) {
            case "CA":
                await getCANormal();
                break;
            case "SI":
                await getSINormal();
                break;
            case "SN":
                await getSNNormal();
                break;
            case "BE":
                await getBENormal();
            break;
            case "DB":
                console.log('\x1b[31m', 'Warning: DB argument with this order is not Valid');
                break;
            default:
                console.log('\x1b[31m', 'ERROR: Bad type argument');
            break;
        }
    } else {
        switch (type) {
            case "DB":
                await getDBReverse();
                break;
            case "BE":
                await getBEReverse();
                break;
            case "SN":
                await getSNReverse();
                break;
            case "SI":
                await getSIReverse();
            break;
            case "CA":
                console.log('\x1b[31m', 'Warning: CA argument with this order is not Valid');
                break;
            default:
                console.log('\x1b[31m', 'ERROR: Bad type argument');
            break;
        }
    } */

    console.table(arrayOfArrays);                                                                         
}

const getCANormal = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    let arrayComponents2 = [];
    let arrayComponents3 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ CA: component , SI: '' , SN: '', BE: '', DB: '' });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ CA: component , SI: component0 , SN: '', BE: '', DB: '' }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayComponents2 = await getAllComponents(PREFIX + component1);  //console.log (arrayComponents2); 
            if (arrayComponents2.length == 0)  arrayOfArrays.push ({ CA: component , SI: component0 , SN: component1, BE: '', DB: '' }); 
            var iterator2 = arrayComponents2.values();  
            for (let component2 of iterator2) {
                arrayComponents3 = await getAllComponents(PREFIX + component2);  //console.log (arrayComponents3);  
                if (arrayComponents3.length == 0)  arrayOfArrays.push ({ CA: component , SI: component0 , SN: component1, BE: component2, DB: '' });  
                var iterator3 = arrayComponents3.values();                                                        
                for (let component3 of iterator3) {  // console.log ({ CA: component , SI: component0 , SN: component1, BE: component2, DB: component3 });           
                    arrayOfArrays.push ({ CA: component , SI: component0 , SN: component1, BE: component2, DB: component3 });                                        
                }  
            }        
        }
    }
}

const getSINormal = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    let arrayComponents2 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ SI: component , SN: '', BE: '', DB: '' });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ SI: component , SN: component0, BE: '', DB: '' }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayComponents2 = await getAllComponents(PREFIX + component1);  //console.log (arrayComponents2); 
            if (arrayComponents2.length == 0)  arrayOfArrays.push ({ SI: component , SN: component0, BE: component1, DB: '' }); 
            var iterator2 = arrayComponents2.values();  
            for (let component2 of iterator2) {                
                arrayOfArrays.push ({ SI: component , SN: component0, BE: component1, DB: component2 });
            }        
        }
    }
}


const getSNNormal = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ SN: component, BE: '', DB: '' });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ SN: component, BE: component0, DB: '' }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayOfArrays.push ({ SN: component, BE: component0, DB: component1 });        
        }
    }
}


const getBENormal = async function () {
    let arrayComponents0 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ BE: component, DB: '' });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayOfArrays.push ({ BE: component, DB: component0 });
    }
}

const getDBReverse = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    let arrayComponents2 = [];
    let arrayComponents3 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: '', BE: '', DB: component });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: '', BE: component0, DB: component }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayComponents2 = await getAllComponents(PREFIX + component1);  //console.log (arrayComponents2); 
            if (arrayComponents2.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: component1, BE: component0, DB: component }); 
            var iterator2 = arrayComponents2.values();  
            for (let component2 of iterator2) {
                arrayComponents3 = await getAllComponents(PREFIX + component2);  //console.log (arrayComponents3);  
                if (arrayComponents3.length == 0)  arrayOfArrays.push ({ CA: '' , SI: component2 , SN: component1, BE: component0, DB: component });  
                var iterator3 = arrayComponents3.values();                       
                for (let component3 of iterator3) {            
                    arrayOfArrays.push ({ CA: component3 , SI: component2 , SN: component1, BE: component0, DB: component });                                                                         
                }  
            }        
        }
    }
}

const getBEReverse = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    let arrayComponents2 = []; 
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: '', BE: '', DB: component });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: component0 , BE: component }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayComponents2 = await getAllComponents(PREFIX + component1);  //console.log (arrayComponents2); 
            if (arrayComponents2.length == 0)  arrayOfArrays.push ({ CA: '' , SI: component1 , SN: component0, BE: component }); 
            var iterator2 = arrayComponents2.values();  
            for (let component2 of iterator2) {
                arrayOfArrays.push ({ CA: component2 , SI: component1 , SN: component0, BE: component }); 
                                                                                             
                }  
            }        
        }
 }


const getSNReverse = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ CA: '' , SI: '' , SN: component });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ CA: '' , SI: component0 , SN: component }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayOfArrays.push ({ CA: component1 , SI: component0 , SN: component });       
        }
    }
}

const getSIReverse = async function () {
    let arrayComponents0 = [];
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({ CA: '' , SI: component });
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayOfArrays.push ({ CA: component0 , SI: component });
    }
}





const getAllRelations = async function () {
    let arrayComponents0 = [];
    let arrayComponents1 = [];
    let arrayComponents2 = [];
    let arrayComponents3 = [];
    let arrayComponents4 = [];
    let arrayComponents5 = [];
    let arrayComponents6 = [];
    let arrayComponents7 = [];
    let arrayComponents8 = [];
    let arrayComponents9 = [];
    let arrayComponents10 = [];
    let arrayComponents11 = [];
    let arrayComponents12 = [];
    let arrayComponents13 = [];
    let arrayComponents14 = [];
    let arrayComponents15 = [];
    let arrayComponents16 = [];
    let arrayComponents17 = [];
    let arrayComponents18 = [];
    let arrayComponents19 = [];
    let arrayComponents20 = [];
    let arrayComponents21 = [];
    let arrayComponents22 = [];
    let arrayComponents23 = [];
    let arrayComponents24 = [];
    let arrayComponents25 = [];
    
    
    arrayComponents0 = await getAllComponents(PREFIX + component);  //console.log (arrayComponents0);        
    if (arrayComponents0.length == 0)  arrayOfArrays.push ({component});
    let iterator0 = arrayComponents0.values();
    for (let component0 of iterator0) {
        arrayComponents1 = await getAllComponents(PREFIX + component0);  //console.log (arrayComponents1);
        if (arrayComponents1.length == 0)  arrayOfArrays.push ({ component , component0 }); 
        var iterator1 = arrayComponents1.values();
        for (let component1 of iterator1) {
            arrayComponents2 = await getAllComponents(PREFIX + component1);  //console.log (arrayComponents2); 
            if (arrayComponents2.length == 0)  arrayOfArrays.push ({ component , component0 , component1 }); 
            var iterator2 = arrayComponents2.values();  
            for (let component2 of iterator2) {
                arrayComponents3 = await getAllComponents(PREFIX + component2);  //console.log (arrayComponents3);  
                if (arrayComponents3.length == 0)  arrayOfArrays.push ({ component , component0 , component1, component2 });  
                var iterator3 = arrayComponents3.values();                       
                for (let component3 of iterator3) { 
                    arrayComponents4 = await getAllComponents(PREFIX + component3);            
                    if (arrayComponents4.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3 }); 
                    let iterator4 = arrayComponents4.values();
                    for (let component4 of iterator4) {
                        arrayComponents5 = await getAllComponents(PREFIX + component4);  //console.log (arrayComponents4);
                        if (arrayComponents5.length == 0)  arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4  });
                        var iterator5 = arrayComponents5.values();
                        for (let component5 of iterator5) {
                            arrayComponents6 = await getAllComponents(PREFIX + component5);  //console.log (arrayComponents2); 
                            if (arrayComponents6.length == 0)  arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5 }); 
                            var iterator6 = arrayComponents6.values();  
                            for (let component6 of iterator6) {
                                arrayComponents7 = await getAllComponents(PREFIX + component6);  //console.log (arrayComponents3);  
                                if (arrayComponents7.length == 0)  arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6 }); 
                                var iterator7 = arrayComponents7.values();                       
                                for (let component7 of iterator7) { 
                                    arrayComponents8 = await getAllComponents(PREFIX + component7);            
                                    if (arrayComponents8.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7 });
                                    var iterator8 = arrayComponents8.values();                       
                                    for (let component8 of iterator8) { 
                                        arrayComponents9 = await getAllComponents(PREFIX + component8);            
                                        if (arrayComponents9.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8 });
                                        var iterator9 = arrayComponents9.values();                       
                                        for (let component9 of iterator9) { 
                                            arrayComponents10 = await getAllComponents(PREFIX + component9);            
                                            if (arrayComponents10.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9 });
                                            var iterator10 = arrayComponents10.values();                       
                                            for (let component10 of iterator10) { 
                                                arrayComponents11 = await getAllComponents(PREFIX + component10);            
                                                if (arrayComponents11.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10 });
                                                var iterator11 = arrayComponents11.values();                       
                                                for (let component11 of iterator11) { 
                                                    arrayComponents12 = await getAllComponents(PREFIX + component11);            
                                                    if (arrayComponents12.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11 });
                                                    var iterator12 = arrayComponents12.values();                       
                                                    for (let component12 of iterator12) { 
                                                        arrayComponents13 = await getAllComponents(PREFIX + component12);            
                                                        if (arrayComponents13.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12 });
                                                        var iterator13 = arrayComponents13.values();                       
                                                        for (let component13 of iterator13) { 
                                                            arrayComponents14 = await getAllComponents(PREFIX + component13);            
                                                            if (arrayComponents14.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13 });
                                                            var iterator14 = arrayComponents14.values();                       
                                                            for (let component14 of iterator14) { 
                                                                arrayComponents15 = await getAllComponents(PREFIX + component14);            
                                                                if (arrayComponents15.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14 });
                                                                var iterator15 = arrayComponents15.values();                       
                                                                for (let component15 of iterator15) { 
                                                                    arrayComponents16 = await getAllComponents(PREFIX + component15);            
                                                                    if (arrayComponents16.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15 });
                                                                    var iterator16 = arrayComponents16.values();                       
                                                                    for (let component16 of iterator16) { 
                                                                        arrayComponents17 = await getAllComponents(PREFIX + component16);            
                                                                        if (arrayComponents17.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16 });
                                                                        var iterator17 = arrayComponents17.values();                       
                                                                        for (let component17 of iterator17) { 
                                                                            arrayComponents18 = await getAllComponents(PREFIX + component17);            
                                                                            if (arrayComponents18.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17 });
                                                                            var iterator18 = arrayComponents18.values();                       
                                                                            for (let component18 of iterator18) { 
                                                                                arrayComponents19 = await getAllComponents(PREFIX + component18);            
                                                                                if (arrayComponents19.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18 }); 
                                                                                var iterator19 = arrayComponents19.values();                       
                                                                                for (let component19 of iterator19) { 
                                                                                    arrayComponents20 = await getAllComponents(PREFIX + component19);            
                                                                                    if (arrayComponents20.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19 }); 
                                                                                    var iterator20 = arrayComponents20.values();                       
                                                                                    for (let component20 of iterator20) { 
                                                                                        arrayComponents21 = await getAllComponents(PREFIX + component20);            
                                                                                        if (arrayComponents21.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20 }); 
                                                                                        var iterator21 = arrayComponents21.values();                       
                                                                                        for (let component21 of iterator21) { 
                                                                                            arrayComponents22 = await getAllComponents(PREFIX + component21);            
                                                                                            if (arrayComponents22.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20, component21 }); 
                                                                                            var iterator22 = arrayComponents22.values();                       
                                                                                            for (let component22 of iterator22) { 
                                                                                                arrayComponents23 = await getAllComponents(PREFIX + component22);            
                                                                                                if (arrayComponents23.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20, component21, component22 }); 
                                                                                                var iterator23 = arrayComponents23.values();                       
                                                                                                for (let component23 of iterator23) { 
                                                                                                    arrayComponents24 = await getAllComponents(PREFIX + component23);            
                                                                                                    if (arrayComponents24.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20, component21, component22, component23 }); 
                                                                                                    var iterator24 = arrayComponents24.values();                       
                                                                                                    for (let component24 of iterator24) { 
                                                                                                        arrayComponents25 = await getAllComponents(PREFIX + component24);            
                                                                                                        if (arrayComponents25.length == 0) arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20, component21, component22, component23, component24 }); 
                                                                                                        var iterator25 = arrayComponents25.values();                       
                                                                                                        for (let component25 of iterator25) {                                                                                                             
                                                                                                            arrayOfArrays.push ({ component , component0 , component1, component2, component3, component4, component5, component6, component7, component8, component9, component10, component11, component12, component13, component14, component15, component16, component17, component18, component19, component20, component21, component22, component23, component24, component25 }); 
                                                                                                        }
                                                                                                    }        
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }  
                                                                                }        
                                                                            }
                                                                        }
                                                                    }
                                                                }  
                                                            }        
                                                        }
                                                    }
                                                }
                                            }  
                                        }        
                                    }
                                }
                            }
                        }  
                    }        
                }
            }
        }
    }  
}        


//INIT Function
init();
