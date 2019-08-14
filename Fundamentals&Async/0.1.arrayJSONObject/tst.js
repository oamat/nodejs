const get1 = () => {
    console.log("call get1");
    return "1";
} 

const get2 = () => {
    console.log("call get2");
    return "2";
} 


var sms = get1() || get2() ;
console.log(sms);

