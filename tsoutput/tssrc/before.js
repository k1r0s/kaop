"use strict";
var Utils_1 = require("./Utils");
var JoinPoint_1 = require("./JoinPoint");
function before() {
    var aspects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        aspects[_i] = arguments[_i];
    }
    return function (proto, key, descriptor) {
        descriptor.value = Utils_1.Utils.bootstrap(JoinPoint_1.JoinPoint.BEFORE_METHOD, {
            method: descriptor.value,
            key: key,
            proto: proto,
            aspects: aspects
        });
        return descriptor;
    };
}
exports.before = before;
