var assert = require("assert");
var Advices = require("../Advices");

Advices.add(
    function prop1() {},
    function prop2() {},
    function prop4() {}
);

Advices.add(
    function prop3() {}
);

describe("Advices::bootstrap()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: null
        }));
        assert.strictEqual(undefined, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: undefined
        }));
        assert.strictEqual(0, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 0
        }));
        assert.strictEqual(false, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: false
        }));
    });

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 1
        }));
        assert.strictEqual(-2, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: -2
        }));
        assert.strictEqual(437.333, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: 437.333
        }));
    });

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: function() {}
        }) === "function");
        assert.deepEqual(["prop1", "prop2", "prop3"], Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["prop1", "prop2", "prop3"]
        }));
        assert.deepEqual({}, Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: {}
        }));
        assert.strictEqual("something", Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: "something"
        }));
    });

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["override", function() {}]
        }) === "function");
    });


    it("if contains any annotation that was not added yet to the Advices pool, it should return the array instead", function() {
        assert(typeof Advices.bootstrap({
            sourceClass: undefined,
            propertyName: undefined,
            propertyValue: ["undefinedAdvice", function() {}]
        }) !== "function");
    });
});
