const { createClass, reflect } = require('../');

const Log = reflect.advice(function(meta){
  console.info(`${meta.key} method called with ${JSON.stringify(meta.args)} returned ${meta.result}`);
})

const LoggerAspect = reflect.aspect((currentProps, key) => {
  if(typeof currentProps[key] === "function") {
    currentProps[key] = [currentProps[key], Log];
  }
  return currentProps;
});

const SomersaultAspect = reflect.aspect((currentProps, key) => {
  if(!currentProps.doSommersault) {
    currentProps.doSommersault = function() {
      return `${this.name} performing a somersault!`;
    }
  }

  return currentProps;
})

const Human = createClass(LoggerAspect(SomersaultAspect({
  name: undefined,
  constructor: function(name){
    this.name = name;
  },
  sayHello: function() {
    return "Hey, I'm " + this.name;
  }
})));

const human = new Human("Samus Aran");

human.sayHello();
human.doSommersault();
