var klass = require("./src/klass");
var aspects = require("./src/aspects");
var Phase = require("./src/Phase");

if (typeof module === "object") {
    module.exports = {
        klass: klass,
        aspects: aspects,
        Phase: Phase
    };
} else {
    window.klass = klass;
    window.aspects = aspects;
    window.Phase = Phase;
}

/**
 * built in aspects
 */

aspects.push(
    Phase.EXECUTE,
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);
