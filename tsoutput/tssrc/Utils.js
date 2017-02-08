"use strict";
var BeforeIteration_1 = require("./BeforeIteration");
var Aspects_1 = require("./Aspects");
var IAspectType_1 = require("./IAspectType");
var Utils = (function () {
    function Utils() {
    }
    Utils.cookAspectDefinition = function (aspectDefinition) {
        var aspectDefinitionPartials = aspectDefinition.split(":");
        return {
            name: aspectDefinitionPartials[0],
            args: aspectDefinitionPartials[1]
        };
    };
    Utils.transpileAspect = function (rawAspect, meta, next) {
        var aspectType = IAspectType_1.AspectTypeBuilder(rawAspect);
        var aspectBody = aspectType.getBody();
        if (!aspectBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            aspectBody += "\nnext();";
        }
        var transpiledFunction = "(function(" + aspectType.getArguments() + ")\n{" + aspectBody + "\n})";
        var SERVICES = Aspects_1.Aspects.SERVICES;
        return eval(transpiledFunction);
    };
    Utils.bootstrap = function (jp, config) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
    return Utils;
}());
exports.Utils = Utils;
