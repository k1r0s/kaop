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
