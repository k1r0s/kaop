var http = require("http")
var assert = require("assert")
var main = require("../index")
var extend = main.extend
var annotations = main.annotations

var Person;
var Programmer;
var CoolProgrammer;
var DataParser;

var normalPerson;
var normalProgrammer;
var ciroreed;

describe("functional testing 1", function(){
  before(function(){

    Person = extend(function(){}, {
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

    normalPerson = new Person("Tom", new Date(1978, 4, 11))
  })

  it("Person instance should have all class methods", function(){
    assert.strictEqual("Tom", normalPerson.name)
    assert.equal(38, normalPerson.getAge())
    assert.equal("Im running!", normalPerson.run())
  })
})

describe("functional testing 2", function(){

  before(function(){

    Programmer = extend(Person, {
      constructor: ["$override", function(parent, name, dborn, favouriteLanguage){
        parent(name, dborn)
        this.favLang = favouriteLanguage
      }],
      run: ["$override", function(parent){
        return parent() + " but... not as faster, coz im fat :/"
      }],
      code: function(){
        return "Im codding in " + this.favLang
      }
    })

    CoolProgrammer = extend(Programmer, {
      run: function(){
        return "IM FAST AS HELL!! GET OUT OF MY WAY!"
      }
    })

    normalPerson = new Person("Joe", new Date(1990, 2, 21))
    normalProgrammer = new Programmer("Mike", new Date(1982, 7, 18), "Java")
    ciroreed = new CoolProgrammer("Ciro", new Date(1990, 8, 22), "Javascript")
  })

  it("class instances should be objects with defined properties", function(){
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

  it("built in annotation $override should import parent method as first argument", function(){
    assert.equal("Im running!", normalPerson.run())
    assert.equal("Im running! but... not as faster, coz im fat :/", normalProgrammer.run())
    assert.equal("IM FAST AS HELL!! GET OUT OF MY WAY!", ciroreed.run())
  })
})

describe("create a new annotation that parses the first parameter that method receives", function(){

  before(function(){
    annotations.add(function $jsonStringify(param){
      this.before(function(opts){
        opts.args[param] = JSON.stringify(opts.args[param])
        this.next()
      })
    })
  })
  it("annotation functions can receive parameters to change their behavior", function(){
    DataParser = extend(function(){}, {
      serialize: ["$jsonStringify: 0", function(serializedObject){
        return serializedObject
      }]
    })
    var datap = new DataParser
    var o = {some: 1, data: {a: "test"}, asd: [{y: 6},{y: "asdasd"},{y: 5}]}

    assert.strictEqual('{"some":1,"data":{"a":"test"},"asd":[{"y":6},{"y":"asdasd"},{"y":5}]}', datap.serialize(o))
  })
  it.skip("annotations can run in background", function(done){
    annotations.add(function $xhrGet(host){
      this.after(function(opts, next){
        http.get({
          host: host
        }, function(res){
          var body
          res.on("data", function(d){ body = body + d});
          res.on("end", function(){
            console.log(body)
            done()
          });

        })
      })
    })
    DataParser = extend(function(){}, {
      serialize: ["$jsonStringify: 0", function(serializedObject){
        return serializedObject
      }],
      send: ["$jsonStringify: 0", "$xhrGet: 'google.es'", function(serializedObject){
        return serializedObject
      }]
    })
    var datap = new DataParser
    var o = {some: 1, data: {a: "test"}, asd: [{y: 6},{y: "asdasd"},{y: 5}]}
    assert.strictEqual('{"some":1,"data":{"a":"test"},"asd":[{"y":6},{"y":"asdasd"},{"y":5}]}', datap.send(o))
  })

})
