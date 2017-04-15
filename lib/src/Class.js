var Advices = require("./Advices");

var Class = function(sourceClass, extendedProperties, _static) {

    var inheritedProperties = Object.create(sourceClass.prototype);

    for (var propertyName in extendedProperties) {
        inheritedProperties[propertyName] = Advices.bootstrap({
            sourceClass: sourceClass,
            propertyName: propertyName,
            propertyValue: extendedProperties[propertyName]
        });
    }

    if (!_static) {
        var extendedClass = function() {
            try {
                for (var propertyName in this) {
                    if (Utils.isFunction(this[propertyName])) {
                        this[propertyName] = this[propertyName].bind(this);
                    } else {
                        // FIXME https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
                        this[propertyName] = eval(JSON.stringify(inheritedProperties[propertyName]));
                    }
                }
            } finally {
                if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
                return this;
            }
        };

        extendedClass.prototype = inheritedProperties;
        return extendedClass;
    } else {
        return inheritedProperties;
    }
};

var exp = function(mainProps) {
    return Class(function() {}, mainProps);
};
exp.inherits = Class;
exp.static = function(mainProps) {
    return Class(function() {}, mainProps, true);
};

module.exports = exp;
