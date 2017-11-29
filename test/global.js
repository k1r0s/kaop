var base = require('../');
var reflect = require('../reflect');

var Log = reflect.advice(function(meta){
  console.info(`${meta.key} method called with ${JSON.stringify(meta.args)} returned ${meta.result}`);
})

var LoggerAspect = reflect.aspect((currentProps, key) => {
  if(typeof currentProps[key] === "function") {
    currentProps[key] = [currentProps[key], Log];
  }
  return currentProps;
});

var SomersaultAspect = reflect.aspect((currentProps, key) => {
  if(!currentProps.doSommersault) {
    currentProps.doSommersault = function() {
      return `${this.name} performing a somersault!`;
    }
  }

  return currentProps;
})

var Person = base.createClass(LoggerAspect(SomersaultAspect({
  name: undefined,
  constructor: function(name){
    this.name = name;
  },
  sayHello: function() {
    return "Hey, I'm " + this.name;
  }
})));

var p = new Person("tali");

p.sayHello();
p.doSommersault();
