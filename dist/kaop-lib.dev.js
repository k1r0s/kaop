(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Class = require("./src/Class");
var Annotations = require("./src/Annotations");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Annotations: Annotations
    };
} else {
    window.Class = Class;
    window.Annotations = Annotations;
}

},{"./src/Annotations":2,"./src/Class":3}],2:[function(require,module,exports){
var Annotations = {
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
        this.isBefore = true;
        var befores = [];
        var afters = [];
        this.before = function(fn) {
            befores.push(fn);
        };
        this.hook = function(fn) {
            if (this.isBefore) {
                befores.push(fn);
            } else {
                afters.push(fn);
            }
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
            if (typeof annotations[i] === "function") {
                storeInstance.isBefore = false;
                continue;
            }
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
        return array.filter(function(item) {
            return typeof item !== "function";
        });
    },
    getAnnotatedMethod: function(array) {
        return array.find(function(item) {
            return typeof item === "function";
        });
    },
    isValidStructure: function(array) {
        return array instanceof Array && array.some(function(item) {
            return typeof item === "function";
        });
    },
    isValidAnnotationArray: function(array) {
        return this.getMethodAnnotations(array)
            .map(function(item) {
                return item.split(":")
                    .shift();
            })
            .every(this.getAnnotation, this);
    },
    compile: function(superClass, propertyName, propertyValue) {
        if (!(
                propertyValue &&
                this.isValidStructure(propertyValue) &&
                this.isValidAnnotationArray(propertyValue)
            )) {
            return propertyValue;
        }

        var selfAnnotations = this;

        return function() {

            var opts = {
                scope: this,
                parentScope: superClass.prototype,
                method: selfAnnotations.getAnnotatedMethod(propertyValue),
                methodName: propertyName,
                args: Array.prototype.slice.call(arguments),
                result: undefined,
                pending: true
            };

            var store = new selfAnnotations.Store(opts);

            selfAnnotations.fireMethodAnnotations(propertyValue, store, selfAnnotations.locals);

            store.next();

            return opts.result;
        };
    }
};

module.exports = Annotations;

},{}],3:[function(require,module,exports){
var annotations = require("./Annotations");

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

},{"./Annotations":2}]},{},[1]);
