var Class = require("./src/Class");
var Advices = require("./src/Advices");
var UseExternal = require("./src/UseExternal");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Advices: Advices,
        use: UseExternal
    };
} else {
    window.Class = Class;
    window.Advices = Advices;
    window.use = UseExternal;
}

/**
 * built in Advices
 */

Advices.add(
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
