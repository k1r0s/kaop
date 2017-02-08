"use strict";
function AspectTypeBuilder(rawAspect) {
    rawAspect.getBody = function () {
        var methodToString = this.toString();
        return methodToString.substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));
    };
    rawAspect.getArguments = function () {
        var methodToString = this.toString();
        return methodToString.substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"));
    };
    return rawAspect;
}
exports.AspectTypeBuilder = AspectTypeBuilder;
