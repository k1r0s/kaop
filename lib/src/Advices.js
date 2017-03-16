var Iteration = require("./Iteration");
var Utils = require("./Utils");

module.exports = Advices = {
    locals: {},
    pool: [],
    add: function() {
        for (var i = 0; i < arguments.length; i++) {
            Advices.pool.push(arguments[i]);
        }
    },
    bootstrap: function(config) {
        if (!(
                config.propertyValue &&
                Utils.isValidStructure(config.propertyValue) &&
                Utils.isRightImplemented(config.propertyValue, Advices.pool)
            )) {
            return config.propertyValue;
        }

        return function() {

            var executionProps = {
                method: Utils.getMethod(config.propertyValue),
                methodName: config.propertyName,
                scope: this,
                parentScope: config.sourceClass.prototype,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            new Iteration(config.propertyValue, executionProps, Advices.pool, Advices.locals);

            return executionProps.result;
        };
    }
};
