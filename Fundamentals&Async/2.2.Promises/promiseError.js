async function promiseErr() {
    return new Promise((resolve, reject) => {
        throw new Error(' promiseErr  Error throw in normal Promise');
    });
}

async function promiseCallback(entry) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {  //añadimos asincronia Callback
            //logic code, BBDD acces for example
            try {
                if (entry) resolve(' promiseCallback resolved ');
                else {
                    throw new Error(' promiseCallback Error throw in callback');
                }
            } catch (error) {
                reject(error);
            }
        }, 500);
    });
}


const start = async function () {
    try {
        console.log("call await promiseErr with Error");
        await promiseErr()
            .then((result) => {
                console.log('Success: ', result);
            })
            .catch((error) => {
                console.log('catch promiseErr Error INSIDE promise ');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseErr Error OUTSIDE promise ');
        console.log("error.message : " + error.message);
    }

    try {

        console.log("call await promiseCallback with error");
        await promise(false)
            .then((result) => {
                console.log('Success: ', result);
            }, error => {
                console.log('catch promiseCallback Error INSIDE promise');
                throw error;
            });
    } catch (error) {
        console.log('catch promiseCallback Error OUTSIDE  promise ');
        console.log("error.message : " + error.message);
    }

    console.log('COMPLETED ?');
}

//start process
start();