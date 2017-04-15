(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Class = require("./src/Class");
var Advices = require("./src/Advices");
var UseExternal = require("./src/UseExternal");

var lib = {
    Class: Class,
    Advices: Advices,
    use: UseExternal
};

if (typeof module === "object") {
    module.exports = lib;
} else if (window) {
    window.kaop = lib;
}

/**
 * built in Advices
 */

 /* istanbul ignore next */
Advices.add(
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);

},{"./src/Advices":2,"./src/Class":3,"./src/UseExternal":5}],2:[function(require,module,exports){
var Iteration = require("./Iteration");
var Utils = require("./Utils");

module.exports = Advices = {
    locals: {},
    pool: [],
    add: function() {
        for (var i = 0; i < arguments.length; i++) {
            Advices.pool.push(arguments[i]);
        }
    },
    bootstrap: function(config) {
        if (!(
                config.propertyValue &&
                Utils.isValidStructure(config.propertyValue) &&
                Utils.isRightImplemented(config.propertyValue, Advices.pool)
            )) {
            return config.propertyValue;
        }

        return function() {

            var executionProps = {
                method: Utils.getMethod(config.propertyValue),
                methodName: config.propertyName,
                scope: this,
                parentScope: config.sourceClass.prototype,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            new Iteration(config.propertyValue, executionProps, Advices.pool, Advices.locals);

            return executionProps.result;
        };
    }
};

},{"./Iteration":4,"./Utils":6}],3:[function(require,module,exports){
var Advices = require("./Advices");

var Class = function(sourceClass, extendedProperties, _static) {

    var inheritedProperties = Object.create(sourceClass.prototype);

    for (var propertyName in extendedProperties) {
        inheritedProperties[propertyName] = Advices.bootstrap({
            sourceClass: sourceClass,
            propertyName: propertyName,
            propertyValue: extendedProperties[propertyName]
        });
    }

    if (!_static) {
        var extendedClass = function() {
            try {
                for (var propertyName in this) {
                    if (Utils.isFunction(this[propertyName])) {
                        this[propertyName] = this[propertyName].bind(this);
                    } else if (extendedProperties.hasOwnProperty(propertyName)) {
                        // FIXME https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
                        // clone js objects, avoid reference point
                        var tmp = JSON.parse(JSON.stringify(extendedProperties[propertyName]));
                        this[propertyName] = tmp;
                    }
                }
            } finally {
                if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
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

},{"./Advices":2}],4:[function(require,module,exports){
var Utils = require("./Utils");

module.exports = Iteration = function(definitionArray, props, pool, locals) {
    if (!definitionArray.length) {
        return;
    }
    this.index = -1;
    this.step = function() {
        this.index++;
        var currentStep = definitionArray[this.index];
        if (typeof currentStep === "function") {
            props.result = currentStep.apply(props.scope, props.args);
            this.step();
        } else if (typeof currentStep === "string") {
            var step = Utils.getAdviceImp(currentStep);
            var rawAdviceFn = Utils.getAdviceFn(step.name, pool);
            var transpiledMethod = Utils.transpileMethod(rawAdviceFn, props, arguments.callee.bind(this), locals);
            if (step.args) {
                eval("transpiledMethod.call(props.scope, " + step.args + ")");
            } else {
                eval("transpiledMethod.call(props.scope)");
            }
        }
    };
    this.step();
};

},{"./Utils":6}],5:[function(require,module,exports){
var Advices = require("./Advices");

module.exports = UseExternal = function(module){
    function checkDependency(dep){
        if(!Advices.locals[dep]) throw new Error("unmet dependency: " + dep);
    }

    module.dependencies.forEach(checkDependency);

    module.advices.forEach(Advices.add, Advices);
};

},{"./Advices":2}],6:[function(require,module,exports){
module.exports = Utils = {
    transpileMethod: function(method, meta, next, locals) {
        var methodToString = method.toString();
        var functionBody = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));
        var functionArguments = methodToString
            .substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"));

        if (!functionBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            functionBody += "\nnext();";
        }

        var transpiledFunction = "(function(" + functionArguments + ")\n{ " + functionBody + " \n})";
        var names = Object.keys(locals);
        for (var i = 0; i < names.length; i++) {
            eval("var " + names[i] + " = locals[names[i]]");
        }
        return eval(transpiledFunction);
    },
    getAdviceImp: function(rawAdviceCall) {
        return {
            name: rawAdviceCall.split(":")[0],
            args: rawAdviceCall.split(":")[1]
        };
    },
    isRightImplemented: function(array, advicePool) {
        var completeAdviceNameList = advicePool
            .map(function(advice) {
                return advice.name;
            });
        var implementedNames = array.filter(Utils.isString)
                    .map(function(adviceImplementation){
                        return adviceImplementation.split(":").shift().trim();
                    });

        return implementedNames.every(function(adviceName) {
                                return completeAdviceNameList.indexOf(adviceName) > -1;
                            });
    },
    isValidStructure: function(implementation) {
        return implementation instanceof Array && implementation.some(Utils.isFunction);
    },
    getMethod: function(array) {
        return array.find(function(item) {
            return typeof item === "function";
        });
    },
    isFunction: function(item) {
        return typeof item === "function";
    },
    isString: function(item) {
        return typeof item === "string";
    },
    getAdviceFn: function(fname, advicePool) {
        return advicePool.find(function(adv) {
            return adv.name === fname;
        });
    }
};

},{}]},{},[1]);
