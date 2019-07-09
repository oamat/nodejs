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
add(1, 1).then((sum1) => {
    console.log("resultado1 : " + sum1);
    return add(sum1, 1);
}).then((sum2) => {
    console.log("resultado2 : " + sum2);
    return add(sum2, 1);
}).then((sum3) => {
    console.log("resultado3 : " + sum3);    
}).catch((e) => {
    console.log(e);
});




