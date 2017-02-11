var Phase = require("./Phase");

module.exports = aspects = {
    locals: {},
    executionArr: [],
    instantiationArr: [],
    push: function() {
        var phase = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            if (phase === Phase.INSTANCE) {
                aspects.instantiationArr.push(arguments[i]);
            } else if (phase === Phase.EXECUTE) {
                aspects.executionArr.push(arguments[i]);
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
        for (var key in aspects.locals) {
            eval("var " + key + " = aspects.locals[key]");
        }
        return eval(transpiledFunction);
    },
    getExecutionIteration: function(rawImplementation) {
        return rawImplementation.filter(aspects.notInInstantiatePhase);
    },
    getInstantiationIteration: function(rawImplementation) {
        return rawImplementation.filter(aspects.notInExecutionPhase);
    },
    notInInstantiatePhase: function(decoratorImplementation) {
        return typeof decoratorImplementation === "function" || !aspects.instantiationArr
            .map(function(decorator) {
                return decorator.name;
            })
            .some(function(decoratorName) {
                return aspects.getDecoratorNameByImplementation(decoratorImplementation) === decoratorName;
            });
    },
    notInExecutionPhase: function(decoratorImplementation) {
        return typeof decoratorImplementation !== "function" && !aspects.executionArr
            .map(function(decorator) {
                return decorator.name;
            })
            .some(function(decoratorName) {
                return aspects.getDecoratorNameByImplementation(decoratorImplementation) === decoratorName;
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
        return aspects.getAllDefinitions().find(function(dec) {
            return dec.name === fname;
        });
    },
    getAllDefinitions: function() {
        return aspects.executionArr.concat(aspects.instantiationArr);
    },
    isRightImplemented: function(array) {
        var completeDecoratorArrayNames = aspects.getAllDefinitions()
            .map(function(decorator) {
                return decorator.name;
            });
        return array
            .filter(aspects.differentFromFunction)
            .map(aspects.getDecoratorNameByImplementation)
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
                aspects.isValidStructure(config.propertyValue) &&
                aspects.isRightImplemented(config.propertyValue)
            )) {
            return config.propertyValue;
        }

        if (config.phase === Phase.EXECUTE) {
            return function() {

                var executionProps = {
                    method: aspects.getDecoratedMethod(config.propertyValue),
                    methodName: config.propertyName,
                    scope: this,
                    parentScope: config.sourceClass.prototype,
                    args: Array.prototype.slice.call(arguments),
                    result: undefined
                };

                new methodExecutionIteration(aspects.getExecutionIteration(config.propertyValue), executionProps);

                return executionProps.result;
            };
        } else if (config.phase === Phase.INSTANCE) {
            var instantiateProps = {
                method: aspects.getDecoratedMethod(config.propertyValue),
                methodName: config.propertyName,
                scope: config.instance
            };
            new methodInstantiationIteration(aspects.getInstantiationIteration(config.propertyValue), instantiateProps);
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
        var stepFunctionName = aspects.getDecoratorNameByImplementation(currentStep);
        var stepArguments = aspects.getDecoratorArgumentsByImplementation(currentStep);
        var rawDecorator = aspects.getDecoratorFn(stepFunctionName);
        var decoratedMethod = aspects.transpileMethod(rawDecorator, props, arguments.callee.bind(this));
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
            var stepFunctionName = aspects.getDecoratorNameByImplementation(currentStep);
            var stepArguments = aspects.getDecoratorArgumentsByImplementation(currentStep);
            var rawDecorator = aspects.getDecoratorFn(stepFunctionName);
            var decoratedMethod = aspects.transpileMethod(rawDecorator, props, arguments.callee.bind(this));
            if (stepArguments) {
                eval("decoratedMethod.call(props.scope, " + stepArguments + ")");
            } else {
                eval("decoratedMethod.call(props.scope)");
            }
        }
    };
    this.step();
};
