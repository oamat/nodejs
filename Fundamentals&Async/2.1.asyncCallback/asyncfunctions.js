var resolveAfter2Seconds = function () {
    console.log("starting slow promise");
    return new Promise(resolve => {
        setTimeout(function () {
            resolve("slow");
            console.log("slow promise is done (2s)");
        }, 2000);
    });
};

var resolveAfter1Second = function () {
    console.log("starting fast promise");
    return new Promise(resolve => {
        setTimeout(function () {
            resolve("fast");
            console.log("fast promise is done (1s)");
        }, 1000);
    });
};

var sequentialStart = async function () {
    console.log('==SEQUENTIAL START, so next line awaits finish all==');

    // 1. Execution gets here almost instantly
    const slow = await resolveAfter2Seconds();
    console.log(slow); // 2. this runs 2 seconds after 1.

    const fast = await resolveAfter1Second();
    console.log(fast); // 3. this runs 3 seconds after 1.
}

var concurrentStart = async function () {
    console.log('==CONCURRENT START with await in the END, so next line awaits finish all==');
    const slow = resolveAfter2Seconds(); // starts timer immediately
    const fast = resolveAfter1Second(); // starts timer immediately

    // 1. Execution gets here almost instantly
    console.log(await slow); // 2. this runs 2 seconds after 1. If I didn't put await the result is a promise pending.
    console.log(await fast); // 3. this runs 2 seconds after 1., immediately after 2., since fast is already resolved. If I didn't put await the result is a promise pending.
}

var concurrentPromise = async function () {
    console.log('==CONCURRENT START with Promise.all, next line no awaits all promises==');
    return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()]).then((messages) => {
        console.log(messages[0]); // slow
        console.log(messages[1]); // fast
    });
}

var parallel = async function () {
    console.log('==PARALLEL with await Promise.all, so next line awaits all promises==');

    // Start 2 "jobs" in parallel and wait for both of them to complete
    await Promise.all([
        (async () => console.log(await resolveAfter2Seconds()))(),
        (async () => console.log(await resolveAfter1Second()))()
    ]);
}

// This function does not handle errors. See warning below!
var parallelPromise = async function () {
    console.log('==PARALLEL with Promise.thenso next line NO awaits finish all==');
    resolveAfter2Seconds().then((message) => console.log(message));
    resolveAfter1Second().then((message) => console.log(message));
}


// This function does not handle errors. See warning below!
var normalfunction = function () {
    console.log('==NORMAL with NO async/await');
    // 1. Execution gets here almost instantly
    const slow = resolveAfter2Seconds();
    console.log(slow); // 2. this runs 2 seconds after 1.

    const fast = resolveAfter1Second();
    console.log(fast); // 3. this runs 3 seconds after 1.
}

sequentialStart(); // after 2 seconds, logs "slow", then after 1 more second, "fast"

// wait above to finish
setTimeout(concurrentStart, 4000); // after 2 seconds, logs "slow" and then "fast"

// wait again
setTimeout(concurrentPromise, 7000); // same as concurrentStart

// wait again
setTimeout(parallel, 10000); // truly parallel: after 1 second, logs "fast", then after 1 more second, "slow"

// wait again
setTimeout(parallelPromise, 13000); // same as parallel

setTimeout(normalfunction, 18000); // Normal function NO Async