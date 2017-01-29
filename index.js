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

/**
 * built in decorators
 */

Decorators.execution(
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
