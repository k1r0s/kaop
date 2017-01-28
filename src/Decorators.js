var Decorators = {
    arr: [
        function override() {
            meta.args.unshift(meta.parentScope[meta.methodName].bind(this));
        }
    ],
    locals: {},
    add: function(ann) {
        Decorators.arr.push(ann);
    },
    names: function() {
        return Decorators.arr.map(function(fn) {
            return fn.name;
        });
    },
    getDecoratorFn: function(annotationName) {
        for (var i = 0; i < Decorators.arr.length; i++) {
            if (Decorators.arr[i].name === annotationName.replace("@", "")) {
                return Decorators.arr[i];
            }
        }
    },
    Store: function(opts, propertyDeclaration) {
        var index = 0;
        this.next = function() {
            var currentStep = propertyDeclaration[index];
            if (typeof currentStep === "function") {
                opts.result = currentStep.apply(opts.scope, opts.args);
            } else if (typeof currentStep === "string") {
                var stepProperties = currentStep.split(":");
                var stepFunctionName = stepProperties[0];
                var stepArguments = stepProperties[1];
                var rawDecorator = Decorators.getDecoratorFn(stepFunctionName);
                var decoratedMethod;
                decoratedMethod = Decorators.transpileMethod(rawDecorator, opts, arguments.callee);
                with(Decorators.locals) {
                    if (stepArguments) {
                        eval("(" + decoratedMethod + ".call(opts.scope, " + stepArguments + "))");
                    } else {
                        eval("(" + decoratedMethod + ".call(opts.scope))");
                    }
                }
            }
            index++;
        };
    },
    transpileMethod: function(method, meta, next) {
        var methodToString = method.toString();
        var methodDeclaration = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));

        if (!methodDeclaration.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            methodDeclaration += "\nnext();"
        }
        return eval("(function(){ " + methodDeclaration + " })");
    },
    getMethodDecorators: function(array) {
        return array.filter(function(item) {
            return typeof item !== "function";
        });
    },
    getDecoratedMethod: function(array) {
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
        return Decorators.getMethodDecorators(array)
            .map(function(item) {
                return item.split(":")
                    .shift();
            })
            .every(Decorators.getDecoratorFn, Decorators);
    },
    compile: function(superClass, propertyName, propertyValue) {
        if (!(
                propertyValue &&
                Decorators.isValidStructure(propertyValue) &&
                Decorators.isValidAnnotationArray(propertyValue)
            )) {
            return propertyValue;
        }

        var selfDecorators = this;

        return function() {

            var opts = {
                scope: this,
                parentScope: superClass.prototype,
                method: selfDecorators.getDecoratedMethod(propertyValue),
                methodName: propertyName,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            var store = new selfDecorators.Store(opts, propertyValue);

            store.next();

            return opts.result;
        };
    }
};

module.exports = Decorators;
