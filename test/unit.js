var assert = require("assert")
var main = require("../index")
var Annotations = main.Annotations

describe("Annotations::compile()", function() {

    it("propertyValue are falsy values, so we must receive it as normal", function() {
        assert.strictEqual(null, Annotations.compile(undefined, undefined, null))
        assert.strictEqual(undefined, Annotations.compile(undefined, undefined, undefined))
        assert.strictEqual(0, Annotations.compile(undefined, undefined, 0))
        assert.strictEqual(false, Annotations.compile(undefined, undefined, false))
    })

    it("propertyValue are numbers, should be retrieved without modifications", function() {
        assert.strictEqual(1, Annotations.compile(undefined, undefined, 1))
        assert.strictEqual(-2, Annotations.compile(undefined, undefined, -2))
        assert.strictEqual(313, Annotations.compile(undefined, undefined, 313))
        assert.strictEqual(437, Annotations.compile(undefined, undefined, 437))
        assert.strictEqual(437.333, Annotations.compile(undefined, undefined, 437.333))
    })

    it("propertyValue are complex types as strings, objects or functions", function() {
        assert(typeof Annotations.compile(undefined, undefined, function() {}) === "function")
        assert.deepEqual(["prop1", "prop2", "prop3"], Annotations.compile(undefined, undefined, ["prop1", "prop2", "prop3"]))
        assert.deepEqual({}, Annotations.compile(undefined, undefined, {}))
        assert.strictEqual("something", Annotations.compile(undefined, undefined, "something"))
    })

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Annotations.compile(undefined, undefined, ["$override", function() {}]) === "function")
    })

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function() {
        assert(typeof Annotations.compile(undefined, undefined, [function() {}, "$override"]) === "function")
    })

    it("if contains any annotation that was not added yet to the Annotations pool, it should return the array instead", function() {
        assert(typeof Annotations.compile(undefined, undefined, ["$annotationThatNotExists", function() {}]) !== "function")
    })
})

describe("Annotations::add, ::names, ::getAnnotation", function() {

    before(function() {
        Annotations.add(function $prop1() {})
        Annotations.add(function $prop2() {})
        Annotations.add(function $prop3() {})
        Annotations.add(function $prop4() {})
    })

    it("Annotations::names() should return all the annotation names", function() {
        var AnnotationsArr = Annotations.names()
        assert(AnnotationsArr.indexOf("$prop2") > -1)
        assert(AnnotationsArr.indexOf("$prop1") > -1)
        assert(AnnotationsArr.indexOf("$prop3") > -1)
        assert(AnnotationsArr.indexOf("$prop4") > -1)
    })
    it("Annotations::getAnnotation() should return the annotation function definition", function() {
        assert.strictEqual("$prop3", Annotations.getAnnotation("$prop3")
            .name)
    })
})

describe("Annotations::getMethodAnnotations()", function() {
    it("should return the complete list of defined Annotations", function() {
        assert.deepEqual(["$httpGet: 'Person'", "$json"],
            Annotations.getMethodAnnotations(["$httpGet: 'Person'", "$json", function() {}]))
        assert.deepEqual(["$httpGet: 'Person'", "$json"],
            Annotations.getMethodAnnotations(["$httpGet: 'Person'", function() {}, "$json"]))
        assert.deepEqual(["$httpGet: 'Person'", "$json"],
            Annotations.getMethodAnnotations([function() {}, "$httpGet: 'Person'", "$json"]))
        assert.deepEqual(["$override"],
            Annotations.getMethodAnnotations(["$override", function() {}]))
    })
})
describe("Annotations::isValidAnnotationArray()", function() {
    it("should check if the given Annotations are declared", function() {
        assert(Annotations.isValidAnnotationArray(["$override", function() {}]))
    })
    it("should return false if the Annotations are not declared", function() {
        assert(!Annotations.isValidAnnotationArray(["$httpGet: 'Person'", "$json", function() {}]))
    })
    it("if the Annotations are declared it must return true", function() {
        Annotations.add(function $httpGet() {})
        Annotations.add(function $json() {})
        assert(Annotations.isValidAnnotationArray(["$httpGet: 'Person'", "$json", function() {}]))
        assert(!Annotations.isValidAnnotationArray(["ajdhkasjadh: 'Person'", "$json", function() {}]))
    })
})
