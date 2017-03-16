var assert = require("assert");
var Utils = require("../lib/src/Utils");

var pool = [function override(){}];

describe("Utils::getAdviceImp()", function() {

    it("should return the annotation function definition", function() {
        assert.strictEqual("prop3", Utils.getAdviceImp("prop3").name);
    });
});

describe("Utils::isRightImplemented()", function() {

    it("should check if the given Advices are declared", function() {
        assert(Utils.isRightImplemented(["override", function() {}], pool));
    });
    it("should return false if the Advices are not declared", function() {
        assert(!Utils.isRightImplemented(["httpGet: 'Person'", "json", function() {}], pool));
    });
});

describe("Utils::isValidStructure()", function() {
    it("advice is rightly implemented", function() {
        var implementation = ["asd", function(){}];
        assert(Utils.isValidStructure(implementation));
    });
    it("advice is not rightly implemented", function() {
        var implementation = 2;
        assert(!Utils.isValidStructure(implementation));
    });
});

describe("Utils::getMethod()", function() {
    it("Should get the function from implementation", function() {
        var implementation = ["asd", function myMethod(){}];
        var result = Utils.getMethod(implementation);
        assert(result.name === "myMethod");
    });
});

describe("Utils::transpileMethod", function() {
    it("third parameter should be always called, even if fn body does not contain the `next` reference", function(done) {
        Utils.transpileMethod(function() {}, {}, done, {})();
    });
    it("function should be assembled with its arguments back", function() {
        assert.strictEqual("secret", Utils.transpileMethod(function(something) {
            return something;
        }, {}, function() {}, {})("secret"));
    });
    it("third parameter should be always called", function(done) {
        Utils.transpileMethod(function() {
            next();
        }, {}, done, {})();
    });
    it("second parameter is the `meta` key word, should be available in the method scope", function(done) {
        Utils.transpileMethod(function() {
            // console.log(meta);
        }, {
            a: 2,
            v: "patata"
        }, done, {})();
    });
});
