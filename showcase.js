const { createClass, reflect } = require('.');

const Log = reflect.advice(function(meta){
  console.info(`${meta.key} method called with ${JSON.stringify(meta.args)} returned ${meta.result}`);
});

const ChargeBean = reflect.advice(function(meta){
  if(!meta.args[0]) {
    meta.commit();
  } else {
    console.info("charging the beam...");
    setTimeout(meta.commit, 100);
  }
});

const LoggerAspect = reflect.aspect((currentProps, key) => {
  if(currentProps[key] instanceof Function) {
    currentProps[key] = [currentProps[key], Log];
  } else if(currentProps[key] instanceof Array) {
    currentProps[key].push(Log);
  }
  return currentProps;
});

const SomersaultAspect = reflect.aspect((currentProps, key) => {
  if(typeof currentProps.doSommersault !== "function") {
    currentProps.doSommersault = function() {
      return `${this.name} performing a somersault!`;
    }
  }

  return currentProps;
})

const Human = createClass(LoggerAspect(SomersaultAspect({
  constructor(name){
    this.name = name;
  },
  beam: [ChargeBean, function(charging, beamType) {
    return `firing${charging ? " charged": ""} ${beamType}!`;
  }],
  sayHello() {
    return `Hey, I'm ${this.name}`;
  }
})));

const human = new Human("Samus Aran");

human.sayHello();
human.doSommersault();
human.beam(false, "normal beam");
human.beam(false, "ice beam");
human.beam(true, "plasma beam");
