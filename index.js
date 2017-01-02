var Class = require("./src/Class");
var Decorators = require("./src/Decorators");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Decorators: Decorators
    };
} else {
    window.Class = Class;
    window.Decorators = Decorators;
}
