
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


const initFunc = (a, b, c, d, ...manyMoreArgs) => {
    console.log("initFunc");
    a(b, c, "TEXT");
    console.log("manyMoreArgs", manyMoreArgs);


}

function funcArgs(a, b, c) {
    console.log(arguments[0] + " " + arguments[1] + " " + arguments[2]);   // expected output: 1 2 3

}




initFunc(func1, func2, func3, "one", "two", "three", "four", "five", "six", func1, func2);

funcArgs(1, 2, 3);


// currying
function add(a){
    return function(b){
      return function(c){
        return a+b+c;
      }
    }
  }
  add(1)(2)(3); // 6