var assert = require("assert");
var main = require("../index");
var Decorators = main.Decorators;
var Phase = main.Phase;

Decorators.push(
    Phase.EXECUTE,
    function prop1() {},
    function prop2() {},
    function prop4() {}
);

Decorators.push(
    Phase.INSTANCE,
    function prop3() {}
);

describe("Decorators::bootstrap()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: null
        }));
        assert.strictEqual(undefined, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: undefined
        }));
        assert.strictEqual(0, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 0
        }));
        assert.strictEqual(false, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: false
        }));
    });

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 1
        }));
        assert.strictEqual(-2, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: -2
        }));
        assert.strictEqual(437.333, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 437.333
        }));
    });

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: function() {}
        }) === "function");
        assert.deepEqual(["prop1", "prop2", "prop3"], Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["prop1", "prop2", "prop3"]
        }));
        assert.deepEqual({}, Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: {}
        }));
        assert.strictEqual("something", Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: "something"
        }));
    });

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Decorators.bootstrap({
            phase: Phase.EXECUTE,
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["override", function() {}]
        }) === "function");
    });


    it("if contains any annotation that was not added yet to the Decorators pool, it should return the array instead", function() {
        assert(typeof Decorators.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["undefinedDecorator", function() {}]
        }) !== "function");
    });
});

describe("Decorators::add, ::names, ::getDecoratorFn", function() {

    it("Decorators::getDecoratorFn() should return the annotation function definition", function() {
        assert.strictEqual("prop3", Decorators.getDecoratorFn("prop3").name);
    });
});

describe("Decorators:: iterations", function() {
    var testImplementation;
    before(function() {
        testImplementation = ["prop1", "prop3", function() {}];
    });
    it("should get only decorators added in execution phase", function() {
        assert.strictEqual("prop1,function () {}", Decorators.getExecutionIteration(testImplementation).join(","));
    });

    it("should get only decorators added in instantation phase", function() {
        assert.strictEqual("prop3", Decorators.getInstantiationIteration(testImplementation).join(","));
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
        Decorators.push(Phase.EXECUTE, function httpGet() {}, function json() {});
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
