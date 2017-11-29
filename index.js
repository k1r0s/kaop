const utils = require("./utils");
const reflect = require("./reflect");

function def(sourceClass, extendedProperties, opts) {
  function extendedType() {
    if (typeof this["constructor"] === "function") this["constructor"].apply(this, arguments);
  }

  extendedType.super = sourceClass;
  extendedType.signature = extendedProperties;
  var wovedProps = reflect.wove(extendedType, extendedProperties);
  extendedType.prototype = Object.assign(Object.create(sourceClass.prototype), wovedProps);
  return extendedType;
}

function index(props) {
  return def(function() {}, props)
}

function inherits(parent, props) {
  return def(parent, props)
}

function clear(targetClass){
  for (var key in targetClass.signature) {
    if(targetClass.signature[key] instanceof Array && utils.isValidArraySignature(targetClass.signature[key])) {
      targetClass.prototype[key] = utils.getMethodFromArraySignature(targetClass.signature[key]);
    }
  }
  return targetClass;
}

// oop
module.exports = {
  createClass: index,
  inherits: inherits,
  clear: clear
}
