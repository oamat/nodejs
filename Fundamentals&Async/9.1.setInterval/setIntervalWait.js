
var counter = 0;

const newCron = async () => {
    var cron = setInterval(function () {
        console.log(" cron " + counter + " time : " + new Date().getUTCSeconds() + ":" + new Date().getUTCMilliseconds() + " " );
        counter++;
        myAsyncPromise();
        if (counter == 10) {
            clearInterval(cron);
            console.log("FINISH cron :" + + new Date().getUTCSeconds() + ":" + new Date().getUTCMilliseconds());
        }
        console.log("last line of code into cron : " + new Date().getUTCSeconds() + ":" + new Date().getUTCMilliseconds());        
    }, 10);
}

myAsyncPromise = async () => {
    await myPromise();
    let j = 234567;
    for(var i=0; i<100000; i++){
        j=i*j + i;
    }
}

myPromise = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("setTimeout into myAsyncPromise :" + new Date().getUTCSeconds() + ":" + new Date().getUTCMilliseconds());            
            resolve();
        }, 5000);
    });
}

newCron();