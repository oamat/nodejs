
async function resolveAfter2Seconds(message) {
    setTimeout(() => {
        console.log(message + new Date());
        return 1;
    }, 2000);
}


var methodAsyncWithAwait = async function() {
    console.log("Start methodAsyncWithAwait() : " + new Date());
    await resolveAfter2Seconds("1.1.methodAsyncWithAwait 1 : ").then(console.log("**** then method1.1 " + new Date()));
    await resolveAfter2Seconds("1.2.methodAsyncWithAwait 2 : ").then(console.log("**** then method1.2 " + new Date()));;
    console.log("##END methodAsyncWithAwait() : " + new Date());
}

var methodAsyncWithOUTAwait = async function () {
    console.log("Start methodAsyncWithOUTAwait() : " + new Date());
    resolveAfter2Seconds("2.1.methodAsyncWithOUTAwait() 1 : ").then(console.log("**** then method2.1 " + new Date()));
    resolveAfter2Seconds("2.2.methodAsyncWithOUTAwait() 2 : ").then(console.log("**** then method2.2 " + new Date()));
    console.log("##END methodAsyncWithOUTAwait() : " + new Date());
}

var methodSimple = function () {
    console.log("Start methodSimple() : " + new Date());
    resolveAfter2Seconds("3.1.methodSimple() 1 : ").then(console.log("**** then method3.1 " + new Date()));
    resolveAfter2Seconds("3.2.methodSimple() 2 : ").then(console.log("**** then method3.2 " + new Date()));
    console.log("##END methodSimple() : " + new Date());
}

methodAsyncWithAwait();

setTimeout(methodAsyncWithOUTAwait, 4000);

setTimeout(methodSimple, 8000); // because is not async: Exception with .then(console.log("finish method1"));

