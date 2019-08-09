async function promiseErr(entry) {
    return new Promise((resolve, reject) => {
        if (entry) reject(new Error(' promiseErr  REJECT in normal Promise way  '));
        else throw new Error(' promiseErr  ERROR throw in normal Promise way ');
    });
}

async function promiseCallback(entry) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {  //añadimos asincronia Callback
            //logic code, BBDD acces for example
            try {
                if (entry) reject(new Error(' promiseCallback REJECT in callback '));
                else throw new Error(' promiseCallback ERROR throw in callback');
            } catch (error) {
                reject(error);
            }
        }, 500);
    });
}


const start = async function () {
    try {
        console.log("call await promiseErr REJECT");
        await promiseErr(true)
            .then((result) => { console.log('Success: ', result); })
            .catch((error) => {
                console.log('catch promiseErr REJECT INSIDE promise ');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseErr REJECT OUTSIDE promise ');
        console.log("error.message : " + error.message);
    }

    try {
        console.log("call await promiseErr ERROR throw");
        await promiseErr(false)
            .then((result) => { console.log('Success: ', result); })
            .catch((error) => {
                console.log('catch promiseErr ERROR throw INSIDE promise ');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseErr ERROR throw OUTSIDE promise ');
        console.log("error.message : " + error.message);
    }

    try {
        console.log("call await promiseCallback REJECT");
        await promiseCallback(true)
            .then((result) => {
                console.log('Success: ', result);
            }, error => {
                console.log('catch promiseCallback REJECT INSIDE promise');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseCallback REJECT OUTSIDE  promise ');
        console.log("error.message : " + error.message);
    }

    try {
        console.log("call await promiseCallback ERROR Throw");
        await promiseCallback(false)
            .then((result) => {
                console.log('Success: ', result);
            }, error => {
                console.log('catch promiseCallback ERROR throw INSIDE promise');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseCallback ERROR throw OUTSIDE  promise ');
        console.log("error.message : " + error.message);
    }

    console.log('COMPLETED ?');
}

//start process
start();