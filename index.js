const utils = require("./utils");

function def(sourceClass, extendedProperties, opts) {
  function extendedType() {
    if (typeof this["constructor"] === "function") this["constructor"].apply(this, arguments);
  }

  extendedType.super = sourceClass;
  extendedType.signature = extendedProperties;
  var wovedProps = utils.wove(extendedType, extendedProperties);
  extendedType.prototype = Object.assign(Object.create(sourceClass.prototype), wovedProps);
  return extendedType;
}

function index(props) {
  return def(function() {}, props)
}

function inherits(parent, props) {
  return def(parent, props)
}

function clear(type){
  for (var key in type.signature) {
    if(type.signature[key] instanceof Array && utils.isValidArraySignature(type.signature[key])) {
      type.prototype[key] = utils.getMethodFromArraySignature(type.signature[key]);
    }
  }
  return type;
}

// oop
module.exports = index;
module.exports.inherits = inherits;
module.exports.clear = clear;
