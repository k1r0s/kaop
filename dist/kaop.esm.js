function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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
  return function() {
    var adviceIndex = -1, prom, resolve, reject;

    var shouldReturnPromise = key !== "constructor" && functionStack.some(function (currentEntry) { return utils.isAsync(currentEntry); });
    if(shouldReturnPromise) {
      prom = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      });
    }

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

var src = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
exports.reflect = exports.provider = exports.inject = exports.override = exports.clear = exports.extend = exports.createClass = void 0;

exports.createClass = main.createClass, exports.extend = main.extend, exports.clear = main.clear;
exports.override = override;
exports.inject = inject;
exports.provider = provider;
exports.reflect = reflect;
});

var index$1 = unwrapExports(src);
var src_1 = src.reflect;
var src_2 = src.provider;
var src_3 = src.inject;
var src_4 = src.override;
var src_5 = src.clear;
var src_6 = src.extend;
var src_7 = src.createClass;

export default index$1;
export { src_5 as clear, src_7 as createClass, src_6 as extend, src_3 as inject, src_4 as override, src_2 as provider, src_1 as reflect };
