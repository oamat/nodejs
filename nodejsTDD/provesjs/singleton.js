var Singleton = (function () {
    var instance;
 
    function createInstance() {
        var object = new Array("1","2","3");
        console.log("return object");
        return object;
    }
 
     return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            console.log("return instance");
            return instance;
        }
    };
})();
 module.exports = Singleton;
