"use strict";
var JoinPoint;
(function (JoinPoint) {
    JoinPoint[JoinPoint["BEFORE_METHOD"] = 0] = "BEFORE_METHOD";
    JoinPoint[JoinPoint["AFTER_METHOD"] = 1] = "AFTER_METHOD";
    JoinPoint[JoinPoint["INSTANCE"] = 2] = "INSTANCE";
})(JoinPoint || (JoinPoint = {}));
exports.JoinPoint = JoinPoint;
