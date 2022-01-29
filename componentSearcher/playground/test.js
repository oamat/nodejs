

component2 = "BE.BKSPRQ";
console.log(component2.lastIndexOf("PRQ"));


let component = "AdmisionActivoOMNISimTablVencWeb.1/obDatSimulacion"
let index = component.indexOf('/');
component = component.substring(index + 1, component.length);
console.log(component);


let component3 = "SN.MCA.ConsultaClientes.consultaCriterios";
component3 = component3.substring(component3.lastIndexOf(".") + 1, component3.length);
console.log(component3);

let component4 = "bkge31p_serv_pro";
index = component4.indexOf("_");
if (index > 0) component4 = component4.substring(0, component4.indexOf("_")).toUpperCase();
component4 = component4.substring(0, 1700);
console.log(component4);

if ("next".substring(0, 10) != "next".substring(0, 10)) {
    console.log("NO IGUALES");
} else {
    console.log("IGUALES");
}

let componentWithoutMethod = "CA.OFI.AsesorVentasPlanificador.pasarCliEspera";
let array = componentWithoutMethod.split(".");
if (array.length > 3) {  //we have a mehtod :  4 "." -> SN.MCA.ConsultaClientes.consultaCriterios 
    array.pop();
    componentWithoutMethod = array.join(".");
    console.log(componentWithoutMethod);
}

let num = "344";
console.log(!isNaN(num));
num = "S";
console.log(!isNaN(num));
num = "2 5 5";
console.log(!isNaN(num));
num = "0";
console.log(!isNaN(num));
num = "0.5";
console.log(!isNaN(num));


console.log(Math.round(186830325));
console.log(Math.round(186));


let array2 = [];

array2["CA.OFI.AsesorVentasPlanificador.pasarCliEspera"] = { cost: 2, tavg: 6 };
array2["CA.OFI.AsesorVentasPlanificador"] = { cost: 3, tavg: 6 };
array2["CA.OFI.AsesorVentasPlanificador3"] = { cost: 3, tavg: 6 };


console.log("array2.length : " + array2.length);

console.log(array2["CA.OFI.AsesorVentasPlanificador"].cost + array2["CA.OFI.AsesorVentasPlanificador.pasarCliEspera"].cost)
console.log(array2["CA.OFI.AsesorVentasPlanificador"].cost + " : " + array2["CA.OFI.AsesorVentasPlanificador.pasarCliEspera"].tavg)
//console.log(app.NORMAL);
let array3 = []
array3.push({ a: { x: 1, y: 2 } })
array3.push({ b: { x: 3, y: 4 } });
console.log("array3.length : " + array3.length);


console.log("array3.a : " + array3["a"]);


var myObj = {
    fred: { apples: 2, oranges: 4, bananas: 7, melons: 0 },
    mary: { apples: 0, oranges: 10, bananas: 0, melons: 0 },
    sarah: { apples: 0, oranges: 0, bananas: 0, melons: 5 }
}

console.log("myObj.length : " + myObj.length);

let array4 = [];
array4.push({ apples: 2, oranges: 4, bananas: 7, melons: 0 });
array4.push({ apples: 2, oranges: 4, bananas: 7, melons: 0 });
array4.push({ apples: 2, oranges: 4, bananas: 7, melons: 0 });

console.log("array4.length : " + array4.length);


let arrayJson = new Array();
let ind = "CA.OFI.AsesorVentasPlanificador.pasarCliEspera";
let ind2 = "CA.OFI.AsesorVentasPlanificador";
//arrayJson.push({ind:{ cost: 2, tavg: 6 }});
arrayJson.ind2 = { cost: 2, tavg: 6 };
console.log("arrayJson.size : " + arrayJson.size);
console.log(arrayJson);
console.log(arrayJson.ind);

let allComponentsSet = new Set();
allComponentsSet.add("component");
allComponentsSet.add("component1");
allComponentsSet.add("component");
allComponentsSet.add("component1");
console.log(allComponentsSet.size);
console.log(allComponentsSet);


let arrayID = [];
arrayID[23232] = { a: "a", b: "b" };
arrayID[23231] = { a: "a", b: "b" };

console.log(arrayID.length);

let db = "DB.BKGCF2P";
let finalChar = 6;
for (let i = 6; i <= db.length; i++) {
    console.log(db.substring(0, i) + " : " + i);
}

let headersForCSVToUnshift = { '0': '0', '1': '1', '2': '2', 'BE': 'BE', 'BC': 'BC', 'DB': 'DB', 'CLUSTER': 'CLUSTER', 'TX': 'TX', 'ADS': 'ADS' }; //the filter case. 
console.log(headersForCSVToUnshift[2]);


let JsonTest = {};
JsonTest[2] = 2;
JsonTest[1] = 1;
console.log(JsonTest);

let json = {}
json['index'] = 1;
let index3 = ++json['index'];
console.log( index3 + " , "+ json['index']);


let componentSI = "=>SI.MCA.AlfabeticPersonaMultiCanal.9.3.1=>SN.MCA.AlfabeticPersonaConPersona.4.1.1";
console.log ( componentSI.split(".").length );

var temp = "This is a string.";
var count = (temp.match(/is/g) || []).length;
console.log(count);
