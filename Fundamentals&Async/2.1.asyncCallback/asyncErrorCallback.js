var resolveAfter1SecondsWithPromise = function (err) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            if (err) {
                console.log("1.We return error inside Promise callback.");
                reject(new Error("1.Error : in Promise callback."));
            } else {
                console.log("1.We return result inside Promise callback.");
                resolve("1.I am the Result : inside Promise callback");
            }
        }, 1000);
    }).then((result) => { return result; })  //return the result number
}


var resolveAfter1SecondsNoPromise = function (err) {
    try {
        setTimeout(function () {
            if (err) {
                console.log("2.We return error inside callback.NO Promise.");
                return new Error("2.Error KO inside callback.NO Promise");
            } else {
                console.log("2.We return result inside callback.NO Promise.");
                return "2.I am the Result : inside callback. NO Promise.";
            }
        }, 1000);
    } catch (error) {
        console.log("entramos en try");  // we don't enter in try/catch
        throw error;
    }
}



const initAll = async () => {


    try { // async function with Promise, return result, it works
        console.log(await resolveAfter1SecondsWithPromise(false));
    } catch (error) {
        console.log(error.message);
    }


    try { // async function with Promise, return error, it works
        console.log(await resolveAfter1SecondsWithPromise(true));
    } catch (error) {
        console.log(error.message);
    }



    try { // async function without Promise, return result, it doesn't work
        console.log(await resolveAfter1SecondsNoPromise(false)); //we obtain undefined. We need a promise
    } catch (error) {
        console.log(error.message);
    }


    try { // async function without Promise, return error, it doesn't work
        console.log(await resolveAfter1SecondsNoPromise(true)); //we obtain an error. 
    } catch (error) {
        console.log(error.message);
    }


}

initAll();