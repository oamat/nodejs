var arrayComponentsPalancas = [];

arrayComponentsPalancas[1] = {};
arrayComponentsPalancas[1]["component"] = "CA.OFI.MENUS0";
arrayComponentsPalancas[1]["description"] = "DF10";

console.log(arrayComponentsPalancas[1].component + " / " + arrayComponentsPalancas[1].description);

arrayComponentsPalancas["new1"] = {};
arrayComponentsPalancas["new1"]["component"] = "CA.OFI.MENUS1";
arrayComponentsPalancas["new1"]["description"] = "DF11";


console.log(arrayComponentsPalancas.new1.component + " / " + arrayComponentsPalancas.new1.description);

let component = "CA.OFI.MENUS2";
let description = "DF12";

arrayComponentsPalancas["new2"] = { component, description };

console.log(arrayComponentsPalancas.new2.component + " / " + arrayComponentsPalancas.new2.description);
console.log(arrayComponentsPalancas);


let arrayComponentsPalancas1 = [];
arrayComponentsPalancas1.push({ component, description });
arrayComponentsPalancas1.push({ component, description });
console.log(arrayComponentsPalancas1);
console.log(arrayComponentsPalancas1[0]);
