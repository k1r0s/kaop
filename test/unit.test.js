var assert = require("assert");
var main = require("../index.js");
var aspects = main.aspects;
var Phase = main.Phase;

aspects.push(
    Phase.EXECUTE,
    function prop1() {},
    function prop2() {},
    function prop4() {}
);

aspects.push(
    Phase.INSTANCE,
    function prop3() {}
);

describe("aspects::bootstrap()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: null
        }));
        assert.strictEqual(undefined, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: undefined
        }));
        assert.strictEqual(0, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 0
        }));
        assert.strictEqual(false, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: false
        }));
    });

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 1
        }));
        assert.strictEqual(-2, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: -2
        }));
        assert.strictEqual(437.333, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 437.333
        }));
    });

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: function() {}
        }) === "function");
        assert.deepEqual(["prop1", "prop2", "prop3"], aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["prop1", "prop2", "prop3"]
        }));
        assert.deepEqual({}, aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: {}
        }));
        assert.strictEqual("something", aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: "something"
        }));
    });

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof aspects.bootstrap({
            phase: Phase.EXECUTE,
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["override", function() {}]
        }) === "function");
    });


    it("if contains any annotation that was not added yet to the aspects pool, it should return the array instead", function() {
        assert(typeof aspects.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["undefinedDecorator", function() {}]
        }) !== "function");
    });
});

describe("aspects::add, ::names, ::getDecoratorFn", function() {

    it("aspects::getDecoratorFn() should return the annotation function definition", function() {
        assert.strictEqual("prop3", aspects.getDecoratorFn("prop3").name);
    });
});

describe("aspects:: iterations", function() {
    var testImplementation;
    beforeAll(function() {
        testImplementation = ["prop1", "prop3", function() {}];
    });
    it("should get only aspects added in execution phase", function() {
        assert.strictEqual("prop1,function () {}", aspects.getExecutionIteration(testImplementation).join(","));
    });

    it("should get only aspects added in instantation phase", function() {
        assert.strictEqual("prop3", aspects.getInstantiationIteration(testImplementation).join(","));
    });
});

describe("aspects::isRightImplemented()", function() {
    it("should check if the given aspects are declared", function() {
        assert(aspects.isRightImplemented(["override", function() {}]));
    });
    it("should return false if the aspects are not declared", function() {
        assert(!aspects.isRightImplemented(["$httpGet: 'Person'", "$json", function() {}]));
    });
    it("if the aspects are declared it must return true", function() {
        aspects.push(Phase.EXECUTE, function httpGet() {}, function json() {});
        assert(aspects.isRightImplemented(["httpGet: 'Person'", "json", function() {}]));
        assert(!aspects.isRightImplemented(["ajdhkasjadh: 'Person'", "json", function() {}]));
    });
});

describe("aspects::transpileMethod", function() {
    it("third parameter should be always called, even if fn body does not contain the `next` reference", function(done) {
        aspects.transpileMethod(function() {}, {}, done)();
    });
    it("function should be assembled with its arguments back", function() {
        assert.strictEqual("secret", aspects.transpileMethod(function(something) {
            return something;
        }, {}, function() {})("secret"));
    });
    it("third parameter should be always called", function(done) {
        aspects.transpileMethod(function() {
            next();
        }, {}, done)();
    });
    it("second parameter is the `meta` key word, should be available in the method scope", function(done) {
        aspects.transpileMethod(function() {
            console.log(meta);
        }, {
            a: 2,
            v: "patata"
        }, done)();
    });
});
