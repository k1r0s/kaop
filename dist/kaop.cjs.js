'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function createInstance(_type, args) {
  args.unshift(null);
  return new (Function.prototype.bind.apply(_type, args));
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

function createProxyFn(target, key, functionStack, customInvoke) {
  var shouldReturnPromise = key !== "constructor" && functionStack.some(function (currentEntry) { return utils.isAsync(currentEntry); });
  if(!shouldReturnPromise) { return createProxy(target, key, functionStack, customInvoke); }
  else {
    // yay, this is a bad practice, but easiest way to do this..
    var auxResolve, auxReject;
    var prom = new Promise(function (resolve, reject) {
      auxResolve = resolve;
      auxReject = reject;
    });
    return createProxy(target, key, functionStack, customInvoke, prom, auxResolve, auxReject);
  }
}

function createProxy(target, key, functionStack, customInvoke, prom, resolve, reject) {
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
      var append = Array.prototype.slice.call(arguments);
      adviceMetadata.args.push.apply(adviceMetadata.args, append);

      adviceIndex++;
      if (functionStack[adviceIndex]) {
        var currentEntry = functionStack[adviceIndex];
        if (!utils.isMethod(currentEntry)) {
          currentEntry.call(undefined, adviceMetadata);
        } else if (!adviceMetadata.prevented) {
          try {
            if(customInvoke) {
              var nscope = customInvoke(adviceMetadata);
              Object.assign(nscope, adviceMetadata.scope);
              adviceMetadata.result = adviceMetadata.scope = nscope;
            } else {
              adviceMetadata.result = currentEntry.apply(adviceMetadata.scope, adviceMetadata.args);
            }
          } catch (e) {
            adviceMetadata.exception = e;
          }
        }
        if (!utils.isAsync(currentEntry)) { adviceMetadata.commit(); }
      } else {
        if(adviceMetadata.exception) {
          if(prom) { reject(adviceMetadata.exception); }
          else { throw adviceMetadata.exception; }
        }        if(prom) { resolve(adviceMetadata.result); }
      }
    }

    var adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: utils.getMethodFromArraySignature(functionStack),
      target: target,
      ES6newTarget: new.target,
      exception: undefined,
      prevented: undefined,
      result: undefined,
      commit: commit,
      prevent: prevent,
      handle: handle,
      skip: skip
    };

    commit();

    if(prom) { return prom; }
    else { return adviceMetadata.result; }
  };
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
    return utils.createInstance(targetClass, Array.prototype.slice.call(arguments));
  }
}

function singleton(targetClass) {
  var instance;
  return function () {
    var args = Array.prototype.slice.call(arguments);
    if (!instance) { instance = utils.createInstance(targetClass, args); }
    return instance;
  }
}

var provider = {
  factory: factory,
  singleton: singleton
};

var createClass = main.createClass;
var extend$1 = main.extend;
var clear$1 = main.clear;

var override_1$1 = override;
var inject_1$1 = inject;
var provider_1$1 = provider;
var reflect_1$1 = reflect;

var src = {
	createClass: createClass,
	extend: extend$1,
	clear: clear$1,
	override: override_1$1,
	inject: inject_1$1,
	provider: provider_1$1,
	reflect: reflect_1$1
};

exports.default = src;
exports.createClass = createClass;
exports.extend = extend$1;
exports.clear = clear$1;
exports.override = override_1$1;
exports.inject = inject_1$1;
exports.provider = provider_1$1;
exports.reflect = reflect_1$1;
