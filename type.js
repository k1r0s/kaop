function def(sourceClass, extendedProperties, opts) {
  function extendedType() {
    if (typeof this["constructor"] === "function") this["constructor"].apply(this, arguments);
  }

  extendedType.super = sourceClass;
  extendedType.signature = extendedProperties;
  var wovedProps = wove(extendedType, extendedProperties);
  extendedType.prototype = Object.assign({}, sourceClass.prototype, wovedProps);
  return extendedType;
}

function wove(target, props){
  var woved = Object.assign({}, props);

  for (var key in woved) {
    if(woved[key] instanceof Array && isValidArraySignature(woved[key])) {
      woved[key] = createProxyFn(target, key, woved[key]);
    }
  }
  return woved;
}

function createProxyFn(target, key, adviceList) {
  var adviceIndex = -1;
  return function() {

    function commitNext() {
      adviceIndex++;
      if (adviceList[adviceIndex]) {
        if (!isMethod(adviceList[adviceIndex])) {
          adviceList[adviceIndex](adviceMetadata);
          if (!isAsync(adviceList[adviceIndex])) adviceMetadata.commit();
        } else {
          adviceMetadata.result = adviceList[adviceIndex].apply(adviceMetadata.scope, adviceMetadata.args);
          adviceMetadata.commit();
        }
      }
    }

    var adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: getProxyMethodBody(adviceList),
      target: target,
      result: undefined,
      commit: commitNext
    };

    commitNext();

    return adviceMetadata.result;
  }
}

function isMethod(fn) {
  return !fn.advice
}

function isValidArraySignature(ff) {
  return ff.every(function(fn) { return typeof fn === "function" }) &&
  ff.filter(isMethod).length === 1;
}

function getProxyMethodBody(adviceList) {
  return adviceList.find(isMethod);
}

function isAsync(rawAdvice) {
  return !!rawAdvice.toString().match(/[a-zA-Z$_]\.commit/);
}

function advice(fn){
  fn.advice = 1;
  return fn;
}

var override = advice(function(meta) {
  meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
});

var inject = function(){
  var providers = Array.prototype.slice.call(arguments);
  return advice(function(meta) {
    if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
    meta.args = providers.map(function(provider) { return provider() });
  });
}

var assign = function(dependencies) {
  return advice(function(meta){
    for (var propName in dependencies) {
      var provider = dependencies[propName];
      meta.scope[propName] = provider();
    }
  });
}

function createInstance(_type) {
  var object = new _type;
  return object;
}

function index(props) {
  return def(function() {}, props)
}

function inherits(parent, props) {
  return def(parent, props)
}

function factory(_type){
  return function () {
    return new _type;
  }
}

function singleton(_type) {
  var instance;
  return function () {
    if (!instance) instance = new _type;
    return instance;
  }
}

function clear(type){
  for (var key in type.signature) {
    if(type.signature[key] instanceof Array && isValidArraySignature(type.signature[key])) {
      type.prototype[key] = getProxyMethodBody(type.signature[key]);
    }
  }
  return type;
}

// oop
module.exports = index;
module.exports.inherits = inherits;

// advices
module.exports.advice = advice;
module.exports.override = override;
module.exports.inject = inject;
module.exports.assign = assign;

// di
module.exports.factory = factory;
module.exports.singleton = singleton;

// remove ioc
module.exports.clear = clear;
