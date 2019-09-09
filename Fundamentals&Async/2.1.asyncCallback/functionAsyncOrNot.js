const functionAsync = async () => {
    var total = 0;
    for (var i = 0; i < 100000; i++) {
        total = total + i;
    }
    console.log("1.INSIDE Async function total : " + total);

    setTimeout(() => { console.log("1.async method 500 INSIDE async function") }, 500);

    return total;
}


const functionNOAsync = () => {
    var total = 0;
    for (var i = 0; i < 100000; i++) {
        total = total + i;
    }
    console.log("1.INSIDE NO async function total : " + total);

    setTimeout(() => { console.log("1.async method 500 INSIDE NOAsync function") }, 500);

    return total;
}



const functionAsync2 = async () => {
    return new Promise((resolve, reject) => {
        console.log("2.INSIDE NOAsync function Promise");
        setTimeout(() => {            
            resolve("2.Async2"); // everything is OK, return result
            //If we cannot save the value, maybe we don't have enough memory, infraestructure problem or something like that            
        }, 500);

    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionNOAsync2 = () => {
    return new Promise((resolve, reject) => {
        console.log("2.INSIDE NOAsync function Promise");
        setTimeout(() => {            
            resolve("2.NOAsync2"); // everything is OK, return result
            //If we cannot save the value, maybe we don't have enough memory, infraestructure problem or something like that            
        }, 500);

    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const init = async () => {
    console.log("1.start program 1, call Async function 1");
    var total1 = functionAsync();
    console.log("1.continue program 1, call NOAsync function 1");
    var total2 = functionNOAsync();
    console.log("1.finish program 1 AsyncTotal is " + total1 + " or with await is " + await total1 + " : And NOAsyncTotal is " + total2);
    console.log("1.finish program 1 AsyncTotal is " + total1 + " : And NOAsyncTotal is " + total2); 
}


const init2 = async () => {
    console.log("2.start program 2, call Async function 2 with return new Promise");
    var total1_2 = functionAsync2();
    console.log("2.continue program 2, call NOAsync function 2 with return new Promise");
    var total2_2 = functionNOAsync2();
    console.log("2.finish program AsyncTotal is " + await total1_2 + " : And NOAsyncTotal is " + await total2_2);
    console.log("2.finish program AsyncTotal is " + total1_2 + " : And NOAsyncTotal is " + total2_2);
}


init();
console.log("**********************************************************");
console.log("**********************************************************");
init2();
