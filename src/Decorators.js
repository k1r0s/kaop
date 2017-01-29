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
    compile: function(superClass, propertyName, propertyValue) {
        if (!(
                propertyValue &&
                Decorators.isValidStructure(propertyValue) &&
                Decorators.isRightImplemented(propertyValue)
            )) {
            return propertyValue;
        }

        return function() {

            var executionProps = {
                method: Decorators.getDecoratedMethod(propertyValue),
                methodName: propertyName,
                scope: this,
                parentScope: superClass.prototype,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            new methodExecutionIteration(Decorators.getExecutionIteration(propertyValue), executionProps);

            return executionProps.result;
        };
    }
};

var methodExecutionIteration = function(definitionArray, props) {
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
