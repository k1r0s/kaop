var Class = require("./src/Class");
var Advices = require("./src/Advices");
var UseExternal = require("./src/UseExternal");

var lib = {
    Class: Class,
    Advices: Advices,
    use: UseExternal
};

if (typeof module === "object") {
    module.exports = lib;
} else if (window) {
    window.kaop = lib;
}

/**
 * built in Advices
 */

 /* istanbul ignore next */
Advices.add(
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
