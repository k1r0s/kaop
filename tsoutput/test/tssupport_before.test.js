"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var before_1 = require("../tssrc/before");
var Aspects_1 = require("../tssrc/Aspects");
Aspects_1.Aspects.SERVICES = {
    $$ajax: {
        get: function (url, cbk) {
            console.log("there was a request to " + url + "...");
            setTimeout(function () {
                console.log("get response from " + url + "!!");
                cbk();
            }, 500);
        }
    }
};
Aspects_1.Aspects.add(function log() {
    console.log(meta.key + " called with " + meta.args);
}, function lug(name) {
    console.log("it is also posible to have arguments in aspects " + name + ", and then interact with the instance " + this[name]);
}, function lag() {
    SERVICES.$$ajax.get("api.coolwebsite.com", next);
});
var Dummy = (function () {
    function Dummy() {
    }
    Dummy.doSomething = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        console.log("\nmethod execution");
        args.pop()();
    };
    return Dummy;
}());
Dummy.url = "dummo";
__decorate([
    before_1.before("log", "lug# 'url'", "lag"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Dummy, "doSomething", null);
describe("tdd", function () {
    it("aspect should be called before method execution", function (done) {
        Dummy.doSomething("asdasd", 2, 1, done);
    });
});
