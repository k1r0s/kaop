"use strict";
var utils_1 = require("./utils");
var JoinPoint_1 = require("./JoinPoint");
function before() {
    var aspects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        aspects[_i - 0] = arguments[_i];
    }
    return function (proto, key, descriptor) {
        descriptor.value = utils_1.utils.bootstrap(JoinPoint_1.JoinPoint.BEFORE_METHOD, {
            method: descriptor.value,
            key: key,
            proto: proto,
            aspects: aspects
        });
        return descriptor;
    };
}
exports.before = before;
