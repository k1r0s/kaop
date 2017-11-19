var type = require('../');
var advice = require('../advice');

var Person = type({
  name: undefined,
  constructor: function(name){
    this.name = name;
  },
  sayHello: function() {
    return "Hey, I'm " + this.name;
  }
})

describe("check basic features", () => {
  it("basic oop features", () => {
    var p = new Person("Ivan Kalash");
    expect(p).toBeInstanceOf(Person);
  });
  it("basic scoped methods", () => {
    var p = new Person("Ivan Kalash");
    expect(p.sayHello()).toEqual("Hey, I'm Ivan Kalash");
  });
});
