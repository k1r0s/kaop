(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Class = require("./src/Class");
var annotations = require("./src/annotations");

if (typeof module !== "undefined") {
  window.Class = Class;
  window.annotations = annotations;
} else {
  module.exports = {
    Class: Class,
    annotations: annotations
  };
}

},{"./src/Class":2,"./src/annotations":3}],2:[function(require,module,exports){
var annotations = require("./annotations");

var Class = function(sourceClass, extendedProperties, static) {

  var inheritedProperties = Object.create(sourceClass.prototype);

  for (var propertyName in extendedProperties) {
    inheritedProperties[propertyName] = annotations.compile(sourceClass, propertyName, extendedProperties[propertyName]);
  }

  if (!static) {
    var extendedClass = function() {
      try {
        if (typeof this.constructor === "function") this.constructor.apply(this, arguments);

        for (var propertyName in this) {
          if (typeof this[propertyName] === "function") {
            this[propertyName] = this[propertyName].bind(this);
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
  return Class(function() {}, mainProps);
};
exp.inherits = Class;
exp.static = function(mainProps) {
  return Class(function() {}, mainProps, true);
};

module.exports = exp;

},{"./annotations":3}],3:[function(require,module,exports){
module.exports = annotations = {
  arr: [
    function $override() {
      this.before(function(opts, next) {
        opts.args.unshift(opts.parentScope[opts.methodName].bind(opts.scope));
        next();
      });
    }
  ],
  locals: {},
  add: function(ann) {
    this.arr.push(ann);
  },
  names: function() {
    return this.arr.map(function(fn) {
      return fn.name;
    });
  },
  getAnnotation: function(annotationName) {
    for (var i = 0; i < this.arr.length; i++) {
      if (this.arr[i].name === annotationName) {
        return this.arr[i];
      }
    }
  },
  Store: function(opts) {
    var befores = [];
    var afters = [];
    this.before = function(fn) {
      befores.push(fn);
    };
    this.after = function(fn) {
      afters.push(fn);
    };
    this.next = function() {
      var nextBeforeFn = befores.shift();
      if (nextBeforeFn) {
        nextBeforeFn.call(this, opts, arguments.callee);
      }
      if (!nextBeforeFn && opts.pending) {
        opts.result = opts.method.apply(opts.scope, opts.args);
        opts.pending = !opts.pending;
      }
      var nextAfterFn = afters.shift();
      if (nextAfterFn) {
        nextAfterFn.call(this, opts, arguments.callee);
      }
    };
  },
  fireMethodAnnotations: function(annotations, storeInstance, locals) {
    for (var i = 0; i < annotations.length; i++) {

      var preparedAnnotation = annotations[i].split(":");
      var annotationFn = this.getAnnotation(preparedAnnotation[0]);
      var annotationArguments = preparedAnnotation[1];

      with(locals) {
        if (annotationArguments) {
          eval("(" + annotationFn + ".call(storeInstance, " + annotationArguments + "))");
        } else {
          eval("(" + annotationFn + ".call(storeInstance))");
        }
      }
    }
  },
  getMethodAnnotations: function(array) {
    return array.filter(function(e, index, arr) {
      return index !== arr.length - 1;
    });
  },
  isValidAnnotationArray: function(array) {
    return this.getMethodAnnotations(array)
      .map(function(item) {
        return item.split(":").shift();
      })
      .every(this.getAnnotation, this);
  },
  compile: function(superClass, propertyName, propertyValue) {
    if (!(
        propertyValue &&
        typeof propertyValue.length === "number" &&
        typeof propertyValue[propertyValue.length - 1] === "function" &&
        this.isValidAnnotationArray(propertyValue)
      )) {
      return propertyValue;
    }

    var selfAnnotations = this;

    return function() {

      var opts = {
        scope: this,
        parentScope: superClass.prototype,
        method: propertyValue[propertyValue.length - 1],
        methodName: propertyName,
        args: Array.prototype.slice.call(arguments),
        result: undefined,
        pending: true
      };

      var store = new selfAnnotations.Store(opts);

      var methodAnnotations = selfAnnotations.getMethodAnnotations(propertyValue);

      selfAnnotations.fireMethodAnnotations(methodAnnotations, store, selfAnnotations.locals);

      store.next();

      return opts.result;
    };
  }
};

},{}]},{},[1]);
