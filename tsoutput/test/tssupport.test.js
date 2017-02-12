"use strict";
var utils_1 = require("../tssrc/utils");
describe("tdd1", function () {
    it("should retrieve aspects attached to a method", function () {
        expect(utils_1.utils.cookAspectDefinition("myAspect")).toEqual({ args: undefined, name: "myAspect" });
        expect(utils_1.utils.cookAspectDefinition("myAspect# 14, 'asd'")).toEqual({ args: " 14, 'asd'", name: "myAspect" });
    });
});
