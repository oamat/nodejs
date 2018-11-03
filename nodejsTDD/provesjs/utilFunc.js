
 function add (a, b, c) { 
 if (c != 0) {
    return adds(a,b,c);
 } else {
   return a + b;
 }
     

 } 

 
 function adds (a, b, c) {  //private function
 return (a + b)*c; 
 } 

 module.exports.add = add;