var Class = require("./src/Class");
var Advices = require("./src/Advices");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Advices: Advices
    };
} else {
    window.Class = Class;
    window.Advices = Advices;
}

/**
 * built in Advices
 */

Advices.add(
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
