var annotations = require("./annotations");

var Class = function(sourceClass, extendedProperties, static) {

  var inheritedProperties = {};

  for (var protoKey in sourceClass.prototype) {
    inheritedProperties[protoKey] = sourceClass.prototype[protoKey];
  }

  for (var propertyName in extendedProperties) {
    inheritedProperties[propertyName] = annotations.compile(sourceClass, propertyName, extendedProperties[propertyName]);
  }

  if (!static) {
    var extendedClass = function() {
      if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
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
