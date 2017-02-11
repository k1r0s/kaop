var aspects = require("./aspects");
var Phase = require("./Phase");

var klass = function(sourceClass, extendedProperties, statik) {

    var inheritedProperties = Object.create(sourceClass.prototype);

    for (var propertyName in extendedProperties) {
        inheritedProperties[propertyName] = aspects.bootstrap({
            phase: Phase.EXECUTE,
            sourceClass: sourceClass,
            propertyName: propertyName,
            propertyValue: extendedProperties[propertyName]
        });
    }

    if (!statik) {
        var extendedClass = function() {
            try {
                if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
                for (var propertyName in this) {
                    if (typeof this[propertyName] === "function") {
                        this[propertyName] = this[propertyName].bind(this);
                        aspects.bootstrap({
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
    return klass(function() {}, mainProps);
};
exp.inherits = klass;
exp.statik = function(mainProps) {
    return klass(function() {}, mainProps, true);
};

module.exports = exp;
