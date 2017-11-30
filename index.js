const utils = require("./utils");
const reflect = require("./reflect");

function def(sourceClass, extendedProperties, opts) {
  function extendedType() {
    if (typeof this["constructor"] === "function") this["constructor"].apply(this, arguments);
  }

  extendedType.super = sourceClass;
  extendedType.signature = extendedProperties;
  const wovedProps = reflect.wove(extendedType, extendedProperties);
  extendedType.prototype = Object.assign(Object.create(sourceClass.prototype), wovedProps);
  return extendedType;
}

function index(props) {
  return def(function() {}, props)
}

function extend(parent, props) {
  return def(parent, props)
}

function clear(targetClass){
  for (const key in targetClass.signature) {
    if(targetClass.signature[key] instanceof Array && utils.isValidArraySignature(targetClass.signature[key])) {
      targetClass.prototype[key] = utils.getMethodFromArraySignature(targetClass.signature[key]);
    }
  }
  return targetClass;
}

// oop
module.exports = {
  createClass: index,
  extend: extend,
  clear: clear
}
