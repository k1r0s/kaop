var assert = require("assert");
var main = require("../index");
var Decorators = main.Decorators;


Decorators.execution(function prop1() {});
Decorators.execution(function prop2() {});
Decorators.declaration(function prop3() {});
Decorators.execution(function prop4() {});


describe("Decorators::compile()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, Decorators.compile(undefined, undefined, null));
        assert.strictEqual(undefined, Decorators.compile(undefined, undefined, undefined));
        assert.strictEqual(0, Decorators.compile(undefined, undefined, 0));
        assert.strictEqual(false, Decorators.compile(undefined, undefined, false));
    });

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, Decorators.compile(undefined, undefined, 1));
        assert.strictEqual(-2, Decorators.compile(undefined, undefined, -2));
        assert.strictEqual(313, Decorators.compile(undefined, undefined, 313));
        assert.strictEqual(437, Decorators.compile(undefined, undefined, 437));
        assert.strictEqual(437.333, Decorators.compile(undefined, undefined, 437.333));
    });

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof Decorators.compile(undefined, undefined, function() {}) === "function");
        assert.deepEqual(["prop1", "prop2", "prop3"], Decorators.compile(undefined, undefined, ["prop1", "prop2", "prop3"]));
        assert.deepEqual({}, Decorators.compile(undefined, undefined, {}));
        assert.strictEqual("something", Decorators.compile(undefined, undefined, "something"));
    });

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Decorators.compile(undefined, undefined, ["override", function() {}]) === "function");
    });

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Decorators.compile(undefined, undefined, [function() {}, "override"]) === "function");
    });

    it("if contains any annotation that was not added yet to the Decorators pool, it should return the array instead", function() {
        assert(typeof Decorators.compile(undefined, undefined, ["$annotationThatNotExists", function() {}]) !== "function");
    });
});

describe("Decorators::add, ::names, ::getDecoratorFn", function() {

    it("Decorators::getDecoratorFn() should return the annotation function definition", function() {
        assert.strictEqual("prop3", Decorators.getDecoratorFn("prop3").name);
    });
});

describe("Decorators::getExecutionIteration", function() {
    it("should get only decorators added in execution phase", function() {
        assert.strictEqual("prop1,function () {}", Decorators.getExecutionIteration(["prop1", "prop3", function() {}]).join(","));
    });

    it("should get only decorators added in declaration phase", function() {
        assert.strictEqual("prop3", Decorators.getDeclarationIteration(["prop1", "prop3", function() {}]).join(","));
    });
});

describe("Decorators::isRightImplemented()", function() {
    it("should check if the given Decorators are declared", function() {
        assert(Decorators.isRightImplemented(["override", function() {}]));
    });
    it("should return false if the Decorators are not declared", function() {
        assert(!Decorators.isRightImplemented(["$httpGet: 'Person'", "$json", function() {}]));
    });
    it("if the Decorators are declared it must return true", function() {
        Decorators.declaration(function httpGet() {});
        Decorators.execution(function json() {});
        assert(Decorators.isRightImplemented(["httpGet: 'Person'", "json", function() {}]));
        assert(!Decorators.isRightImplemented(["ajdhkasjadh: 'Person'", "json", function() {}]));
    });
});

describe("Decorators::transpileMethod", function() {
    it("third parameter should be always called, even if fn body does not contain the `next` reference", function(done) {
        Decorators.transpileMethod(function() {}, {}, done)();
    });
    it("function should be assembled with its arguments back", function() {
        assert.strictEqual("secret", Decorators.transpileMethod(function(something) {
            return something;
        }, {}, function() {})("secret"));
    });
    it("third parameter should be always called", function(done) {
        Decorators.transpileMethod(function() {
            next();
        }, {}, done)();
    });
    it("second parameter is the `meta` key word, should be available in the method scope", function(done) {
        Decorators.transpileMethod(function() {
            console.log(meta);
        }, {
            a: 2,
            v: "patata"
        }, done)();
    });
});
