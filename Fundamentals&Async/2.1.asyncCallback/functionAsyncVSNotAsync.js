const iteratorNum = 10000;

const loopReturn = () => {
    let total = 0;
    for (var i = 0; i < iteratorNum; i++) {
        total = total + i;
    }
    return total;
}

const functionAsync1 = async () => {
    return loopReturn();
}

const functionNOAsync1 = () => {
    return loopReturn();
}

const functionAsync2WithPromise = async () => {
    return new Promise((resolve, reject) => {
        resolve(loopReturn());
    });
    //.then((result) => { return result; })  //return the result number
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionNOAsync2WithPromise = () => {
    return new Promise((resolve, reject) => {
        resolve(loopReturn());
    })
    //.then((result) => { return result; })  //return the result number
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionAsync2WithPromiseAndCatch = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(loopReturn());
        } catch (error) { reject(error) }
    })
    //.then((result) => { return result; })  //return the result number
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionAsync2WithPromiseWithThen = async () => {
    return new Promise((resolve, reject) => {
        resolve(loopReturn());
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionAsync2WithPromiseWithThenAndCatch = async () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(loopReturn());
        } catch (error) { reject(error) }
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic... A reject callback will pass through here
}

const functionNOAsync3WithPromiseAndCode = () => {
    setTimeout(() => {
        console.log("3.finish NOAsyncPromise and code");
        return 34;
    }, 500);
    return new Promise((resolve, reject) => {
        resolve(loopReturn());
    });
}

const functionAsync3WithPromiseAndCode = async () => {
    setTimeout(() => {
        console.log("3.finish AsyncPromise and Code ");
        return 36;
    }, 1000);
    return new Promise((resolve, reject) => {
        resolve(loopReturn());
    });
}
//.....................................INITS .......



const initAsync1 = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionAsync1();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionAsync1();
    }
    console.log("1.finish Async1 :  " + (new Date().getMilliseconds() - now) + "ms Total is " + total);

}

const initNOAsync1 = async () => {
    let now = new Date().getMilliseconds();
    let total = functionNOAsync1();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + functionNOAsync1();
    }
    console.log("1.finish NOAsync1 : " + (new Date().getMilliseconds() - now) + "ms Total is " + total);

}


const initAsync2WithPromise = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionAsync2WithPromise();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionAsync2WithPromise();
    }
    console.log("2.finish Async2WithPromise  :  " + (new Date().getMilliseconds() - now) + "ms Total is " + total);

}

const initAsync2WithPromiseAndCatch = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionAsync2WithPromiseAndCatch();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionAsync2WithPromiseAndCatch();
    }
    console.log("2.finish Async2WithPromiseAndCatch  :  " + (new Date().getMilliseconds() - now) + "ms Total is " + total);

}

const initNOAsync2WithPromise = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionNOAsync2WithPromise();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionNOAsync2WithPromise();
    }
    console.log("2.finish NOAsync2WithPromise  : " + (new Date().getMilliseconds() - now) + "ms NOTotal is " + total);
}


const initAsync2WithPromiseWithThen = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionAsync2WithPromiseWithThen();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionAsync2WithPromiseWithThen();
    }
    console.log("2.finish Async2WithPromiseWithThen  :  " + (new Date().getMilliseconds() - now) + "ms Total is " + total);
}



const initAsync2WithPromiseWithThenAndCatch = async () => {
    let now = new Date().getMilliseconds();
    let total = await functionAsync2WithPromiseWithThenAndCatch();
    for (var i = 0; i < iteratorNum; i++) {
        total = total + await functionAsync2WithPromiseWithThenAndCatch();
    }
    console.log("2.finish Async2WithPromiseWithThenAndCatch  :  " + (new Date().getMilliseconds() - now) + "ms Total is " + total);
}

const initAll = async () => {

    for (var i = 0; i < 10; i++) {

        // await initNOAsync1();   // método síncrono sin función interna asíncrona, 1º  más rápido
        // await initNOAsync2WithPromise();  // método síncrono que devuelve un return new promise. (puedo usar await).  3º más rápido
        await initAsync1();     // método asíncrono sin función interna asíncrona. 2º más rápido
        await initAsync2WithPromise(); // método asíncrono que No devuelve un return new promise.    3º más rápido
        await initAsync2WithPromiseAndCatch()   // método asíncrono que devuelve un return new Promise y catch...  4º más lento  
        //await initAsync2WithPromiseWithThen();  // método asíncrono que devuelve un return new Promise with then...  5º más lento   
        // await initAsync2WithPromiseWithThenAndCatch(); // método asíncrono que devuelve un return new Promise with then y catch...  el más lento
    }

    //let result1 = await functionNOAsync3WithPromiseAndCode();
    //console.log("3.finish NOAsync3WithPromiseAndCode :  " + result1);
    //let result2 = await functionAsync3WithPromiseAndCode();
    //console.log("3.finish Async3WithPromiseAndCode :  " + result2);

}


initAll();