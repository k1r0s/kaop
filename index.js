var Class = require("./src/Class");
var Decorators = require("./src/Decorators");
var Phase = require("./src/Phase");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Decorators: Decorators,
        Phase: Phase
    };
} else {
    window.Class = Class;
    window.Decorators = Decorators;
    window.Phase = Phase;
}

/**
 * built in decorators
 */

Decorators.push(
    Phase.EXECUTE,
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
