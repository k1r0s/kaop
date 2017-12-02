const { createClass, reflect, provider, inject } = require('.');

// Log advice. This advice logs all info within the called method
const Log = reflect.advice(function(meta){
  console.info(`${meta.key} method called with
    ${JSON.stringify(meta.args)} returned ${meta.result}`);
});

// ChargeBean advice. if the first argument is truthy, next
// function will be delayed 100ms
const ChargeBean = reflect.advice(function(meta){
  if(!meta.args[0]) {
    meta.commit();
  } else {
    console.info("charging the beam...");
    setTimeout(meta.commit, 100);
  }
});

// create a provider of Beam class
const BeamProvider = provider.factory(createClass({
  use(beamType) {
    return `firing ${beamType}`;
  }
}));

// LoggerAspect applies Log advice to every method
const LoggerAspect = reflect.aspect((currentProps, key) => {
  if(currentProps[key] instanceof Function) {
    currentProps[key] = [currentProps[key], Log];
  } else if(currentProps[key] instanceof Array) {
    currentProps[key].push(Log);
  }
  return currentProps;
});

// SomersaultAspect adds `doSommersault` method
const SomersaultAspect = reflect.aspect((currentProps, key) => {
  if(typeof currentProps.doSommersault !== "function") {
    currentProps.doSommersault = function() {
      return `${this.name} performing a somersault!`;
    }
  }

  return currentProps;
})

// create an Human class with LoggerAspect and SomersaultAspect
// and we apply ChargeBean advice directly to `fire` method
const Human = createClass(
  LoggerAspect(SomersaultAspect({
    // inject beam instance on $beam property before
    // main constructor gets executed
    constructor: [inject.assign({ $beam: BeamProvider }), function(_name){
      this.name = _name;
    }],
    fire: [ChargeBean, function(charging, fireType) {
      return this.$beam.use(fireType);
    }],
    sayHello() {
      return `Hey, I'm ${this.name}`;
    }
  }))
);

const human = new Human("Samus Aran");

human.sayHello();
human.doSommersault();
human.fire(false, "normal");
human.fire(false, "ice");
human.fire(true, "plasma");
