"use strict";
var BeforeIteration_1 = require("./BeforeIteration");
var Aspects_1 = require("./Aspects");
var utils = (function () {
    function utils() {
    }
    utils.cookAspectDefinition = function (aspectDefinition) {
        var definition = aspectDefinition.split("#");
        return {
            name: definition[0],
            args: definition[1]
        };
    };
    utils.transpileAspect = function (rawAspect, meta, next) {
        var methodToString = rawAspect.toString();
        var functionBody = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));
        var functionArguments = methodToString
            .substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"));
        if (!functionBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            functionBody += "\nnext();";
        }
        var transpiledFunction = "(function(" + functionArguments + ")\n{ " + functionBody + " \n})";
        var SERVICES = Aspects_1.Aspects.SERVICES;
        return eval(transpiledFunction);
    };
    utils.bootstrap = function (jp, config) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var props;
            props = {
                method: config.method,
                key: config.key,
                proto: config.proto,
                aspects: config.aspects,
                scope: this,
                args: args,
                result: null
            };
            new BeforeIteration_1.BeforeIteration(props);
        };
    };
    return utils;
}());
exports.utils = utils;
