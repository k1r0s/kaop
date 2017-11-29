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

function clear(createClass){
  for (var key in createClass.signature) {
    if(createClass.signature[key] instanceof Array && utils.isValidArraySignature(createClass.signature[key])) {
      createClass.prototype[key] = utils.getMethodFromArraySignature(createClass.signature[key]);
    }
  }
  return createClass;
}

// oop
module.exports = index;
module.exports.inherits = inherits;
module.exports.clear = clear;
