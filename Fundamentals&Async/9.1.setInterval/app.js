
const newYearCron = (counter, str) => {
    var newYearCountdown = setInterval(function () {
        console.log(counter + str);
        counter--
        if (counter == 0) {
            console.log("FINISH: HAPPY NEW YEAR!!");
            clearInterval(newYearCountdown);
        }
    }, 1000);
}

const CountTo5s = (counter2, str2) => {
    var interval = setInterval(function () {
        console.log(counter2 + str2);
        counter2++
        if (counter2 == 5) {
            clearInterval(interval);
            console.log("FINISH : Count 0 to 5");
        }
    }, 1000, counter2, str2);
}
    newYearCron(10, " . countDown for new year.");
    CountTo5s(0, " . count to 5.");