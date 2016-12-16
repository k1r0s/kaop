var Class = require("./src/Class");
var Annotations = require("./src/Annotations");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Annotations: Annotations
    };
} else {
    window.Class = Class;
    window.Annotations = Annotations;
}
