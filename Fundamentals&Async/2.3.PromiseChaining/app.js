console.log('Starting app.');

const add = (a, b) => {  // declaración función add para sumar dos params
    return new Promise((resolve, reject) => {  // creamos una promesa para hacer la suma
        //logic code , BBDD acces or request, etc

        //reject("Arguments must be numbers");   //para forzar excepción

        if (typeof a === 'number' && typeof b === 'number') { //comprobamos los valores
            setTimeout(() => { resolve(a + b) }, 2000)  // devolvemos en 2s el resultado
        } else {
            reject("Arguments must be numbers");
        }
    })
}

// Promise Chaining, se enlazan promises con los return, además la exception (p.e reject) es para todos.
var sumatorioPC = 0;
var sumatorioAwait = 0;
add(1, 1).then((sum1) => {
    console.log("resultado1 PChain: " + sum1);
    sumatorioPC = sumatorioPC + sum1;
    return add(sum1, 1);
}).then((sum2) => {
    console.log("resultado2 PChain: " + sum2);
    sumatorioPC = sumatorioPC + sum2;
    return add(sum2, 1);
}).then((sum3) => {
    console.log("resultado3 PChain: " + sum3);
    sumatorioPC = sumatorioPC + sum3;
    console.log ( "sumatorio PChain: " + sumatorioPC);
}).catch((e) => {
    console.log(e);
});


// Promise Chaining, con await dentro de un método async  auqnue si se abusa de await se convierte en código síncrono
const doWork = async () => {
    const sum1 = await add(1, 1);
    console.log("resultado1 await: " + sum1);
    const sum2 = await add(sum1, 1);
    console.log("resultado2 await: " + sum2);
    const sum3 = await add(sum2, 1);
    console.log("resultado3 await: " + sum3);
    sumatorioAwait = sum1+sum2+sum3;
    console.log ( "sumatorio await: " + sumatorioAwait);
}

doWork();

