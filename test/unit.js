var assert = require("assert")
var main = require("../index")
var extend = main.extend
var annotations = main.annotations

describe("unit test", function(){
  describe("annotations::compile()", function(){

    it("propertyValue are falsy values, so we must receive it as normal", function(){
      assert.strictEqual(null, annotations.compile(undefined, undefined, null))
      assert.strictEqual(undefined, annotations.compile(undefined, undefined, undefined))
      assert.strictEqual(0, annotations.compile(undefined, undefined, 0))
      assert.strictEqual(false, annotations.compile(undefined, undefined, false))
    })

    it("propertyValue are numbers, should be retrieved without modifications", function(){
      assert.strictEqual(1, annotations.compile(undefined, undefined, 1))
      assert.strictEqual(-2, annotations.compile(undefined, undefined, -2))
      assert.strictEqual(313, annotations.compile(undefined, undefined, 313))
      assert.strictEqual(437, annotations.compile(undefined, undefined, 437))
      assert.strictEqual(437.333, annotations.compile(undefined, undefined, 437.333))
    })

    it("propertyValue are complex types as strings, objects or functions", function(){
      assert(typeof annotations.compile(undefined, undefined, function(){}) === "function")
      assert.deepEqual(["prop1", "prop2", "prop3"], annotations.compile(undefined, undefined, ["prop1", "prop2", "prop3"]))
      assert.deepEqual({}, annotations.compile(undefined, undefined, {}))
      assert.strictEqual("something", annotations.compile(undefined, undefined, "something"))
    })

    it("propertyValue is an array that contains a function in the last slot, it should return the annotatedFunction", function(){
      assert(typeof annotations.compile(undefined, undefined, ["$override", function(){}]) === "function")
    })

    it("if contains any annotation that was not added yet to the annotations pool, it should return the array instead", function(){
      assert(typeof annotations.compile(undefined, undefined, ["$annotationThatNotExists", function(){}]) !== "function")
    })
  })

  describe("annotations::add, ::names, ::getAnnotation", function(){

    before(function(){
      annotations.add(function $prop1(){})
      annotations.add(function $prop2(){})
      annotations.add(function $prop3(){})
      annotations.add(function $prop4(){})
    })

    it("annotations::names() should return all the annotation names", function(){
      var annotationsArr = annotations.names()
      assert(annotationsArr.indexOf("$prop2") > -1)
      assert(annotationsArr.indexOf("$prop1") > -1)
      assert(annotationsArr.indexOf("$prop3") > -1)
      assert(annotationsArr.indexOf("$prop4") > -1)
    })
    it("annotations::getAnnotation() should return the annotation function definition", function(){
      assert.strictEqual("$prop3", annotations.getAnnotation("$prop3").name)
    })
  })
})
