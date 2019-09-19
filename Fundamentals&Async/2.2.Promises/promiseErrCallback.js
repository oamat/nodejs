var errPromise = async () => {
    return new Promise((resolve, reject) => {
        reject(new Error(" reject Promise"));
    });
}

var errPromiseCallback = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(" reject PromiseCallback"));
        }, 1);
    });
}

var errAsyncFunction = async () => {
    throw new Error(" throwErr AsyncFunction");
}

var errAsyncFunctionCallback = async () => {
    setTimeout(() => {
        console.log("we cannot catch the err in AsyncFunctionCallback without Promise");
        //throw new Error("ww"); Uncaugcht exception
        return new Error(" throwErr AsyncFunctionCallback"); 
               
    }, 10);

}



const init = async () => {
    try {
        errPromise().catch((error) => {
            console.log(error.message);
        });
    } catch (error) {
        console.log(error.message);
    }

    try {

        errPromiseCallback().catch((error) => {
            console.log(error.message);
        });
    } catch (error) {
        console.log(error.message);
    }


    try {
        errAsyncFunction().catch((error) => {
            console.log(error.message);
        });
    } catch (error) {
        console.log(error.message);
    }

    try {
        errAsyncFunctionCallback().catch((error) => {
            console.log(error.message);
        });
    } catch (error) {
        console.log(error.message);
    }

}


init();