"use strict";
var Aspects = (function () {
    function Aspects() {
    }
    Aspects.add = function () {
        var aspects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            aspects[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < aspects.length; i++) {
            this._store.push(aspects[i]);
        }
    };
    Aspects.getAspect = function (aspectName) {
        return this._store.find(function (aspect) { return aspect.name === aspectName; });
    };
    return Aspects;
}());
exports.Aspects = Aspects;
Aspects._store = [];
