var assert = require("assert")
var main = require("../index")
var Decorators = main.Decorators

describe("Decorators::compile()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, Decorators.compile(undefined, undefined, null))
        assert.strictEqual(undefined, Decorators.compile(undefined, undefined, undefined))
        assert.strictEqual(0, Decorators.compile(undefined, undefined, 0))
        assert.strictEqual(false, Decorators.compile(undefined, undefined, false))
    })

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, Decorators.compile(undefined, undefined, 1))
        assert.strictEqual(-2, Decorators.compile(undefined, undefined, -2))
        assert.strictEqual(313, Decorators.compile(undefined, undefined, 313))
        assert.strictEqual(437, Decorators.compile(undefined, undefined, 437))
        assert.strictEqual(437.333, Decorators.compile(undefined, undefined, 437.333))
    })

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof Decorators.compile(undefined, undefined, function() {}) === "function")
        assert.deepEqual(["prop1", "prop2", "prop3"], Decorators.compile(undefined, undefined, ["prop1", "prop2", "prop3"]))
        assert.deepEqual({}, Decorators.compile(undefined, undefined, {}))
        assert.strictEqual("something", Decorators.compile(undefined, undefined, "something"))
    })

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Decorators.compile(undefined, undefined, ["@override", function() {}]) === "function")
    })

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Decorators.compile(undefined, undefined, [function() {}, "@override"]) === "function")
    })

    it("if contains any annotation that was not added yet to the Decorators pool, it should return the array instead", function() {
        assert(typeof Decorators.compile(undefined, undefined, ["$annotationThatNotExists", function() {}]) !== "function")
    })
})

describe("Decorators::add, ::names, ::getAnnotation", function() {

    before(function() {
        Decorators.add(function prop1() {})
        Decorators.add(function prop2() {})
        Decorators.add(function prop3() {})
        Decorators.add(function prop4() {})
    })

    it("Decorators::getAnnotation() should return the annotation function definition", function() {
        assert.strictEqual("prop3", Decorators.getAnnotation("@prop3")
            .name)
    })
})

describe("Decorators::getMethodDecorators()", function() {
    it("should return the complete list of defined Decorators", function() {
        assert.deepEqual(["@httpGet: 'Person'", "@json"],
            Decorators.getMethodDecorators(["@httpGet: 'Person'", "@json", function() {}]))
        assert.deepEqual(["$httpGet: 'Person'", "$json"],
            Decorators.getMethodDecorators(["$httpGet: 'Person'", function() {}, "$json"]))
        assert.deepEqual(["_httpGet: 'Person'", "_json"],
            Decorators.getMethodDecorators([function() {}, "_httpGet: 'Person'", "_json"]))
        assert.deepEqual(["&override"],
            Decorators.getMethodDecorators(["&override", function() {}]))
    })
})
describe("Decorators::isValidAnnotationArray()", function() {
    it("should check if the given Decorators are declared", function() {
        assert(Decorators.isValidAnnotationArray(["@override", function() {}]))
    })
    it("should return false if the Decorators are not declared", function() {
        assert(!Decorators.isValidAnnotationArray(["$httpGet: 'Person'", "$json", function() {}]))
    })
    it("if the Decorators are declared it must return true", function() {
        Decorators.add(function httpGet() {})
        Decorators.add(function json() {})
        assert(Decorators.isValidAnnotationArray(["@httpGet: 'Person'", "@json", function() {}]))
        assert(!Decorators.isValidAnnotationArray(["ajdhkasjadh: 'Person'", "@json", function() {}]))
    })
})
