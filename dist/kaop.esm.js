function isMethod(fn) {
  return !fn.advice
}

function isValidArraySignature(ff) {
  return ff.every(function(fn) { return typeof fn === "function" }) &&
  ff.filter(isMethod).length === 1;
}

function getMethodFromArraySignature(adviceList) {
  return adviceList.find(isMethod);
}

function createInstance(_type) {
  return new _type;
}

function isAsync(rawAdvice) {
  return !!rawAdvice.toString().match(/[a-zA-Z$_]\.commit/);
}

var utils = {
  isMethod: isMethod,
  isValidArraySignature: isValidArraySignature,
  getMethodFromArraySignature: getMethodFromArraySignature,
  isAsync: isAsync,
  createInstance: createInstance
};

function advice(fn){
  fn.advice = 1;
  return fn;
}

function aspect(fn){
  return function(props) {
    return Object.keys(props).reduce(fn, props)
  };
}
function wove(target, props){
  var woved = Object.assign({}, props);

  for (var key in woved) {
    if(woved[key] instanceof Array && utils.isValidArraySignature(woved[key])) {
      woved[key] = createProxyFn(target, key, woved[key]);
    }
  }
  return woved;
}

function createProxyFn(target, key, functionStack) {
  return function() {
    var adviceIndex = -1;
    function skip () {
      adviceIndex = functionStack.findIndex(utils.isMethod) - 1;
    }
    function handle () {
      var ext = adviceMetadata.exception;
      delete adviceMetadata.exception;
      return ext;
    }
    function prevent () {
      adviceMetadata.prevented = true;
    }
    function commit () {
      adviceIndex++;
      if (functionStack[adviceIndex]) {
        var currentEntry = functionStack[adviceIndex];
        if (!utils.isMethod(currentEntry)) {
          currentEntry.call(undefined, adviceMetadata);
        } else if (!adviceMetadata.prevented) {
          try {
            adviceMetadata.result = currentEntry.apply(adviceMetadata.scope, adviceMetadata.args);
          } catch (e) {
            adviceMetadata.exception = e;
          }
        }
        if (!utils.isAsync(currentEntry)) { adviceMetadata.commit(); }
      } else {
        if(adviceMetadata.exception) { throw adviceMetadata.exception; }
      }
    }

    var adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: utils.getMethodFromArraySignature(functionStack),
      target: target,
      exception: undefined,
      prevented: undefined,
      result: undefined,
      commit: commit,
      prevent: prevent,
      handle: handle,
      skip: skip
    };

    commit();

    return adviceMetadata.result;
  }
}

var reflect = {
  advice: advice,
  aspect: aspect,
  wove: wove,
  createProxyFn: createProxyFn,
};

function def(sourceClass, extendedProperties, opts) {
  function extendedType() {
    if (typeof this["constructor"] === "function") { this["constructor"].apply(this, arguments); }
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

function extend(parent, props) {
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
var main = {
  createClass: index,
  extend: extend,
  clear: clear
};

var apply = reflect.advice(function(meta) {
  meta.target.super.prototype[meta.key].apply(meta.scope, meta.args);
});

var implement = reflect.advice(function(meta) {
  meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
});

var override = {
  apply: apply,
  implement: implement
};

function args(){
  var providers = Array.prototype.slice.call(arguments);
  return reflect.advice(function(meta) {
    if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
    providers.forEach(function(provider) { meta.args.push(provider()); });
  })
}

function assign(dependencies) {
  return reflect.advice(function(meta){
    for (var propName in dependencies) {
      var provider = dependencies[propName];
      meta.scope[propName] = provider();
    }
  });
}

var inject = {
  args: args,
  assign: assign
};

function factory(targetClass){
  return function () {
    return utils.createInstance(targetClass);
  }
}

function singleton(targetClass) {
  var instance;
  return function () {
    if (!instance) { instance = utils.createInstance(targetClass); }
    return instance;
  }
}

var provider = {
  factory: factory,
  singleton: singleton
};

var src = {
  createClass: main.createClass,
  extend: main.extend,
  clear: main.clear,
  override: override,
  inject: inject,
  provider: provider,
  reflect: reflect
};
var src_1 = src.createClass;
var src_2 = src.extend;
var src_3 = src.clear;
var src_4 = src.override;
var src_5 = src.inject;
var src_6 = src.provider;
var src_7 = src.reflect;

export default src;
export { src_1 as createClass, src_2 as extend, src_3 as clear, src_4 as override, src_5 as inject, src_6 as provider, src_7 as reflect };
