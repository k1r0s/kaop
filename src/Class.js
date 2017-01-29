var Decorators = require("./Decorators");
var Phase = require("./Phase");

var Class = function(sourceClass, extendedProperties, static) {

    var inheritedProperties = Object.create(sourceClass.prototype);

    for (var propertyName in extendedProperties) {
        inheritedProperties[propertyName] = Decorators.bootstrap({
            phase: Phase.EXECUTE,
            sourceClass: sourceClass,
            propertyName: propertyName,
            propertyValue: extendedProperties[propertyName]
        });
    }

    if (!static) {
        var extendedClass = function() {
            try {
                if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
                for (var propertyName in this) {
                    if (typeof this[propertyName] === "function") {
                        this[propertyName] = this[propertyName].bind(this);
                        Decorators.bootstrap({
                            phase: Phase.INSTANCE,
                            instance: this,
                            propertyName: propertyName,
                            propertyValue: extendedProperties[propertyName]
                        });
                    }
                }
            } finally {
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
