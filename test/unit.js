var assert = require("assert")
var main = require("../index")
var extend = main.extend
var annotations = main.annotations

annotations.add(function $twice(opts){
  return opts.method() + opts.method()
})

var Person = extend(function(){}, {
  constructor: function(name, dborn){
    this.name = name
    this.dborn = dborn
  },
  run: function(){
    return "Im running!"
  },
  getAge: function(){
    var currentYear = new Date().getFullYear()
    var yearBorn = this.dborn.getFullYear()
    return currentYear - yearBorn
  }
})

var Programmer = extend(Person, {
  constructor: function $override(parent, name, dborn, favouriteLanguage){
    parent(name, dborn)
    this.favLang = favouriteLanguage
  },
  run: function $override(parent){
    return parent() + " but... not as faster, coz im fat :/"
  },
  code: function(){
    return "Im codding in " + this.favLang
  }
})

var CoolProgrammer = extend(Programmer, {
  run: function(){
    return "IM FAST AS HELL!! GET OUT OF MY WAY!"
  },
  fly: function $twice(){
    return "yay drugs! "
  }
})

var normalPerson;
var normalProgrammer;
var ciroreed;

describe("begin k-oop tests", function(){

  before(function(){
    normalPerson = new Person("Joe", new Date(1990, 2, 21))
    normalProgrammer = new Programmer("Mike", new Date(1982, 7, 18), "Java")
    ciroreed = new CoolProgrammer("Ciro", new Date(1990, 8, 22), "Javascript")
  })

  it("should have several properties", function(){
    assert.equal("Joe", normalPerson.name)
    assert.equal("Mike", normalProgrammer.name)
    assert.equal("Ciro", ciroreed.name)

    assert.notEqual("C#", ciroreed.favLang)
  })

  it("inner instances should inherit superClass properties", function(){
    assert.equal(26, normalPerson.getAge())
    assert.notEqual(26, normalProgrammer.getAge())
    assert.equal(26, ciroreed.getAge())

    assert.throws(function(){
      normalPerson.code()
    }, Error)

    assert.notEqual("Im codding in Java", ciroreed.code())
    assert.equal("Im codding in Java", normalProgrammer.code())
  })

  it("should override methods with $override", function(){
    assert.equal("Im running!", normalPerson.run())
    assert.notEqual("Im running!", normalProgrammer.run())
    assert.equal("Im running! but... not as faster, coz im fat :/", normalProgrammer.run())
    assert.equal("IM FAST AS HELL!! GET OUT OF MY WAY!", ciroreed.run())
  })

  it("methods should be modified with annotations", function(){
    assert.equal("yay drugs! yay drugs! ", ciroreed.fly());
  })

})
