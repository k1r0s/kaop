const { createClass, extend } = require('../');

const Person = createClass({
  name: undefined,
  constructor: function(name){
    this.name = name;
  },
  sayHello: function() {
    return "Hey, I'm " + this.name;
  }
});

const Programmer = extend(Person, {
  code: function() {
    return this.sayHello() + " and I code";
  }
});

const List = extend(Array, {
  has: function(val) {
    return this.indexOf(val) > -1;
  }
});

describe("check basic features", () => {
  it("basic oop features", () => {
    const p = new Person("Ivan Kalash");
    expect(p).toBeInstanceOf(Person);
  });
  it("basic scoped methods", () => {
    const p = new Person("Ivan Kalash");
    expect(p.sayHello()).toEqual("Hey, I'm Ivan Kalash");
  });
  it("basic oop inheritance", () => {
    const prog = new Programmer("Ivan Kalash");
    expect(prog).toBeInstanceOf(Person);
    expect(prog).toBeInstanceOf(Programmer);
    expect(prog.sayHello()).toEqual("Hey, I'm Ivan Kalash");
    expect(prog.code()).toEqual("Hey, I'm Ivan Kalash and I code");
  });
  it("extend JS built in Types", () => {
    const l = new List;
    expect(l).toBeInstanceOf(Array);
    l.push(4, 5, 6);
    expect(l).toBeInstanceOf(List);
    expect(typeof l.has).toEqual("function");
    expect(l.has(5)).toBeTruthy();
  });
});
