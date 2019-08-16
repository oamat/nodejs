var resolveAfter2Seconds = function (err) {
    console.log("starting slow promise resolveAfter2Seconds " + new Date());
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            try {
                if (err) reject(new Error("error in promise callback resolveAfter2Seconds."));
                else resolve("slow resolveAfter2Seconds");
                console.log("slow resolveAfter2Seconds promise is done (2s)  " + new Date());
            } catch (error) {
                console.log("Catch reject error in promiseCallback resolveAfter1Seconds");
            }

        }, 2000);
    });
}


var resolveAfter1Seconds = function (err) { //
    console.log("starting fast promise resolveAfter1Seconds " + new Date());
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            try {
                if (err) reject(new Error("error in promise callback resolveAfter1Seconds."));
                else resolve("fast resolveAfter1Seconds");
                console.log("fast resolveAfter1Seconds promise is done (1s) " + new Date());
            } catch (error) {
                console.log("Catch reject error in promiseCallback resolveAfter1Seconds");
            }
        }, 1000);
    });
}

var errPromise = function (err) { //
    console.log("starting errPromise " + new Date());
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            if (err) reject(new Error("error in promise callback promiseErr."));
            else {
                throw new Error("throw Error in errPromise callback");  // This is an error... doesn't work.
            }
        }, 1000);
    });
}



const p1 = async () => {
    console.log("starting p1 with rejects " + new Date());
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('p1_delayed_rejection')), 5000);
    })
}
const p2 = async () => {
    console.log("starting p1 with rejects " + new Date());
    return new Promise((resolve, reject) => {
        reject(new Error('p2_immediate_rejection'));
    })
}

var parallel = async function () {
    try {
        console.log('-> PARALLEL  Promises.all with await Promise.all,  so next line awaits all promises');
        // Start 2 "jobs" in parallel and wait for both of them to complete
        await Promise.all([
            resolveAfter2Seconds(false),
            resolveAfter1Seconds(false),
            errPromise(true)
        ]);
        console.log("-> FINISH PARALLEL Promises.all when both finished. ");
    } catch (error) {
        console.log("first Catch: stop process & catch error " + error.message);
        //console.error(error);
    }

    try {
        console.log("--> starting promise.all with rejects");
        await Promise.all([
            p1().catch(error => { return error }),
            p2().catch(error => { return error })
        ]).then(values => {
            console.log(" then promise.all");
            if (values[0] instanceof Error)  console.log(values[0].message) // "p1_delayed_rejection"
            if (values[0] instanceof Error) console.log(values[1].message) // "Error: p2_immediate_rejection"
        });
    } catch (error) {
        console.log("Second Catch: stop process & catch error " + error.message);
        console.error(error);
    }



}

parallel();



