const getNull = () => {
    console.log("call getNull");
    return null;
}

const get0 = () => {
    console.log("call get0");
    return 0;
}

const get1 = () => {
    console.log("call get1");
    return 1;
}

const get2 = () => {
    console.log("call get2");
    return 2;
}


var sms = getNull() || get0() || get1() || get2();
console.log("valid value is : " + sms);

if (getNull()) { console.log("return null and enter if(getNull) "); }

if (get0()) { console.log("return 0 and enter if(get0) "); }

if (get1()) { console.log("return 1 and enter if(get1) "); }

if (!getNull() || !get0() || !get1() || !get2()) { console.log("return null and enter if(!getNull) "); }

