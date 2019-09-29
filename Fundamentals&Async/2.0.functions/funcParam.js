
const func1 = (a, b) => {
    console.log("func1");
    a(b);
}

const func2 = (a) => {
    console.log("func2");
    a();
}

const func3 = () => {
    console.log("func3");
}


const initFunc = (a, b, c, ...manyMoreArgs) => {
    console.log("initFunc");
    a(b, c);
    console.log("manyMoreArgs", manyMoreArgs);

}

initFunc(func1, func2, func3, func1, func2, "one", "two", "three", "four", "five", "six");

