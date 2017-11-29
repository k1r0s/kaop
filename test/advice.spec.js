var type = require('../');
var advice = require('../advice');

var methodSpy = jest.fn()

var Cache = (function() {
  var CACHE_KEY = "#CACHE";
  return {
    read: advice(function(meta){
      if(!meta.scope[CACHE_KEY]) meta.scope[CACHE_KEY] = {};

      if(meta.scope[CACHE_KEY][meta.key]) {
        meta.result = meta.scope[CACHE_KEY][meta.key];
        meta.break();
      }
    }),
    write: advice(function(meta){
      meta.scope[CACHE_KEY][meta.key] = meta.result;
    })
  }
})();

var Person = type({
  constructor(name, yearBorn) {
    this.name = name;
    this.age = new Date(yearBorn, 1, 1);
  },

  _veryHeavyCalculation: [Cache.read, function() {
      methodSpy();
      var today = new Date();
      return today.getFullYear() - this.age.getFullYear();
  }, Cache.write],

  sayHello(){
    return `hello, I'm ${this.name}, and I'm ${this._veryHeavyCalculation()} years old`;
  }
})


var personInstance;

describe("advance advice specs", () => {
  beforeEach(() => {
    personInstance = new Person("Manuelo", 1998);
  })

  it("cache advices should avoid '_veryHeavyCalculation' to be called more than once", () => {
    personInstance.sayHello();
    personInstance.sayHello();
    personInstance.sayHello();
    expect(methodSpy).toHaveBeenCalledTimes(1)

  })

})
