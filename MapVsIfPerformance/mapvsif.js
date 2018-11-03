
//var initialize
var emisor = "VOD";
var valor = 0;
var repeticiones = 10000000;
var mapSize = 100000;
var map = new Map();

//Map initialize
for (var i = 0; i < mapSize; i++) {
    map.set(i, i);
}

//Map test
console.time("Map time");
for (var i = 0; i < repeticiones; i++) {
    map.get(i);
}
console.timeEnd("Map time");

//Simple If test
console.time("if time 1");
for (var i = 0; i < repeticiones; i++) {
    if (valor==0) {  valor++;  }
}
console.timeEnd("if time 1");

//&& if test
console.time("if time 2");
for (var i = 0; i < repeticiones; i++) {
    if (emisor.toString() == "VOD" && valor==0) {  valor++;  }
}
console.timeEnd("if time 2");
