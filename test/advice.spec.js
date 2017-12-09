const { createClass, reflect } = require('../');

const methodSpy = jest.fn();

const Delay = secs => reflect.advice(meta => setTimeout(meta.commit, secs));

const Cache = (function() {
  const CACHE_KEY = "#CACHE";
  return {
    read: reflect.advice(meta => {
      if(!meta.scope[CACHE_KEY]) meta.scope[CACHE_KEY] = {};

      if(meta.scope[CACHE_KEY][meta.key]) {
        meta.result = meta.scope[CACHE_KEY][meta.key];
        meta.prevent();
      }
    }),
    write: reflect.advice(meta => {
      meta.scope[CACHE_KEY][meta.key] = meta.result;
    })
  }
})();

const Person = createClass({
  constructor(name, yearBorn) {
    this.name = name;
    this.age = new Date(yearBorn, 1, 1);
  },

  _veryHeavyCalculation: [Cache.read, function() {
      methodSpy();
      const today = new Date();
      return today.getFullYear() - this.age.getFullYear();
  }, Cache.write],

  sayHello(){
    return `hello, I'm ${this.name}, and I'm ${this._veryHeavyCalculation()} years old`;
  },

  testBreak: [
    reflect.advice(meta => meta.break()),
    reflect.advice(_ => { throw new Error("avoooid!") }),
    function(num) {
      return num * num;
    }
  ],

  doSomething: [Delay(300), function(cbk) {
    cbk();
  }]
})

let personInstance;

describe("advance reflect.advice specs", () => {
  beforeAll(() => {
    personInstance = new Person("Manuelo", 1998);
  })

  it("cache advices should avoid '_veryHeavyCalculation' to be called more than once", () => {
    personInstance.sayHello();
    personInstance.sayHello();
    personInstance.sayHello();
    expect(methodSpy).toHaveBeenCalledTimes(1)

  })

  it("Delay advice should stop the execution for at least one segond", done => {
    const time = Date.now();
    personInstance.doSomething(function() {
      expect(Date.now() - time).toBeGreaterThan(280);
      done();
    });
  });

  it("meta.break should jump to main method", () => {
    expect(personInstance.testBreak(2)).toBe(4);
  });

})
