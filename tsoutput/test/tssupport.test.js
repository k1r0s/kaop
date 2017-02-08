"use strict";
var Utils_1 = require("../tssrc/Utils");
describe("tdd1", function () {
    it("should retrieve aspects attached to a method", function () {
        expect(Utils_1.Utils.cookAspectDefinition("myAspect")).toEqual({ args: undefined, name: "myAspect" });
        expect(Utils_1.Utils.cookAspectDefinition("myAspect: 14, 'asd'")).toEqual({ args: " 14, 'asd'", name: "myAspect" });
    });
});
