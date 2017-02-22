(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Class = require("./src/Class");
var Decorators = require("./src/Decorators");
var Phase = require("./src/Phase");

if (typeof module === "object") {
    module.exports = {
        Class: Class,
        Decorators: Decorators,
        Phase: Phase
    };
} else {
    window.Class = Class;
    window.Decorators = Decorators;
    window.Phase = Phase;
}

/**
 * built in decorators
 */

Decorators.push(
    Phase.EXECUTE,
    function override() {
        meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
    }
);

},{"./src/Class":2,"./src/Decorators":3,"./src/Phase":4}],2:[function(require,module,exports){
var Decorators = require("./Decorators");
var Phase = require("./Phase");

var Class = function(sourceClass, extendedProperties, static) {

    var inheritedProperties = Object.create(sourceClass.prototype);

    for (var propertyName in extendedProperties) {
        inheritedProperties[propertyName] = Decorators.bootstrap({
            phase: Phase.EXECUTE,
            sourceClass: sourceClass,
            propertyName: propertyName,
            propertyValue: extendedProperties[propertyName]
        });
    }

    if (!static) {
        var extendedClass = function() {
            try {
                if (typeof this.constructor === "function") this.constructor.apply(this, arguments);
                for (var propertyName in this) {
                    if (typeof this[propertyName] === "function") {
                        this[propertyName] = this[propertyName].bind(this);
                        Decorators.bootstrap({
                            phase: Phase.INSTANCE,
                            instance: this,
                            propertyName: propertyName,
                            propertyValue: extendedProperties[propertyName]
                        });
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

},{"./Decorators":3,"./Phase":4}],3:[function(require,module,exports){
var Phase = require("./Phase");

module.exports = Decorators = {
    locals: {},
    executionArr: [],
    instantiationArr: [],
    push: function() {
        var phase = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            if (phase === Phase.INSTANCE) {
                Decorators.instantiationArr.push(arguments[i]);
            } else if (phase === Phase.EXECUTE) {
                Decorators.executionArr.push(arguments[i]);
            }
        }
    },
    transpileMethod: function(method, meta, next) {
        var methodToString = method.toString();
        var functionBody = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));
        var functionArguments = methodToString
            .substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"));

        if (!functionBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            functionBody += "\nnext();";
        }

        var transpiledFunction = "(function(" + functionArguments + ")\n{ " + functionBody + " \n})";
        with(Decorators.locals) {
            return eval(transpiledFunction);
        }
    },
    getExecutionIteration: function(rawImplementation) {
        return rawImplementation.filter(Decorators.notInInstantiatePhase);
    },
    getInstantiationIteration: function(rawImplementation) {
        return rawImplementation.filter(Decorators.notInExecutionPhase);
    },
    notInInstantiatePhase: function(decoratorImplementation) {
        return typeof decoratorImplementation === "function" || !Decorators.instantiationArr
            .map(function(decorator) {
                return decorator.name;
            })
            .some(function(decoratorName) {
                return Decorators.getDecoratorNameByImplementation(decoratorImplementation) === decoratorName;
            });
    },
    notInExecutionPhase: function(decoratorImplementation) {
        return typeof decoratorImplementation !== "function" && !Decorators.executionArr
            .map(function(decorator) {
                return decorator.name;
            })
            .some(function(decoratorName) {
                return Decorators.getDecoratorNameByImplementation(decoratorImplementation) === decoratorName;
            });
    },
    differentFromFunction: function(item) {
        return typeof item !== "function";
    },
    getDecoratedMethod: function(array) {
        return array.find(function(item) {
            return typeof item === "function";
        });
    },
    isValidStructure: function(descriptor) {
        return descriptor instanceof Array && descriptor.some(function(item) {
            return typeof item === "function";
        });
    },
    getDecoratorFn: function(fname) {
        return Decorators.getAllDefinitions().find(function(dec) {
            return dec.name === fname;
        });
    },
    getAllDefinitions: function() {
        return Decorators.executionArr.concat(Decorators.instantiationArr);
    },
    isRightImplemented: function(array) {
        var completeDecoratorArrayNames = Decorators.getAllDefinitions()
            .map(function(decorator) {
                return decorator.name;
            });
        return array
            .filter(Decorators.differentFromFunction)
            .map(Decorators.getDecoratorNameByImplementation)
            .every(function(implementationName) {
                return completeDecoratorArrayNames.indexOf(implementationName) > -1;
            });
    },
    getDecoratorNameByImplementation: function(rawDecoratorImplementation) {
        return rawDecoratorImplementation.split(":")[0];
    },
    getDecoratorArgumentsByImplementation: function(rawDecoratorImplementation) {
        return rawDecoratorImplementation.split(":")[1];
    },
    bootstrap: function(config) {
        if (!(
                config.propertyValue &&
                Decorators.isValidStructure(config.propertyValue) &&
                Decorators.isRightImplemented(config.propertyValue)
            )) {
            return config.propertyValue;
        }

        if (config.phase === Phase.EXECUTE) {
            return function() {

                var executionProps = {
                    method: Decorators.getDecoratedMethod(config.propertyValue),
                    methodName: config.propertyName,
                    scope: this,
                    parentScope: config.sourceClass.prototype,
                    args: Array.prototype.slice.call(arguments),
                    result: undefined
                };

                new methodExecutionIteration(Decorators.getExecutionIteration(config.propertyValue), executionProps);

                return executionProps.result;
            };
        } else if (config.phase === Phase.INSTANCE) {
            var instantiateProps = {
                method: Decorators.getDecoratedMethod(config.propertyValue),
                methodName: config.propertyName,
                scope: config.instance
            };
            new methodInstantiationIteration(Decorators.getInstantiationIteration(config.propertyValue), instantiateProps);
        }
    }
};

var methodInstantiationIteration = function(definitionArray, props) {
    if (!definitionArray.length) {
        return;
    }
    this.index = -1;
    this.step = function() {
        this.index++;
        var currentStep = definitionArray[this.index];
        var stepFunctionName = Decorators.getDecoratorNameByImplementation(currentStep);
        var stepArguments = Decorators.getDecoratorArgumentsByImplementation(currentStep);
        var rawDecorator = Decorators.getDecoratorFn(stepFunctionName);
        var decoratedMethod = Decorators.transpileMethod(rawDecorator, props, arguments.callee.bind(this));
        if (stepArguments) {
            eval("decoratedMethod.call(props.scope, " + stepArguments + ")");
        } else {
            eval("decoratedMethod.call(props.scope)");
        }
    };
    this.step();
};

var methodExecutionIteration = function(definitionArray, props) {
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
            var stepFunctionName = Decorators.getDecoratorNameByImplementation(currentStep);
            var stepArguments = Decorators.getDecoratorArgumentsByImplementation(currentStep);
            var rawDecorator = Decorators.getDecoratorFn(stepFunctionName);
            var decoratedMethod = Decorators.transpileMethod(rawDecorator, props, arguments.callee.bind(this));
            if (stepArguments) {
                eval("decoratedMethod.call(props.scope, " + stepArguments + ")");
            } else {
                eval("decoratedMethod.call(props.scope)");
            }
        }
    };
    this.step();
};

},{"./Phase":4}],4:[function(require,module,exports){
module.exports = {
    INSTANCE: 0,
    EXECUTE: 1
};

},{}]},{},[1]);
