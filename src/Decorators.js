var Phase = require("./Phase");

module.exports = Decorators = {
    arr: [],
    locals: {},
    add: function(def) {
        Decorators.arr.push(def);
    },
    decoratorNames: function() {
        return Decorators.arr.map(function(dec) {
            return dec.decorator.name;
        });
    },
    transpileMethod: function(method, meta, next) {
        var methodToString = method.toString();
        var methodDeclaration = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));

        if (!methodDeclaration.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            methodDeclaration += "\nnext();";
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
    getDecoratorFn: function(fname) {
        return Decorators.arr.find(function(dec) {
            return dec.decorator.name === fname;
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
    fireMethod: function(methodDefinitionArray, props, phase) {
        if (phase === Phase.EVALUATION) {

        } else if (phase === Phase.RUNTIME) {

        }
    },
    compile: function(superClass, propertyName, propertyValue) {
        if (!(
                propertyValue &&
                Decorators.isValidStructure(propertyValue) &&
                Decorators.isValidAnnotationArray(propertyValue)
            )) {
            return propertyValue;
        }

        var evaluationProps = {
            method: Decorators.getDecoratedMethod(propertyValue),
            methodName: propertyName
        };

        Decorators.fireMethod(propertyValue, evaluationProps, Phase.EVALUATION);

        return function() {

            var runtimeProps = {
                method: evaluationProps.method,
                methodName: evaluationProps.methodName,
                scope: this,
                parentScope: superClass.prototype,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            Decorators.fireMethod(propertyValue, runtimeProps, Phase.RUNTIME);

            return runtimeProps.result;
        };
    }
};
