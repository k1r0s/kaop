const { createClass, reflect } = require('../src');

const onException = reflect.advice(meta => {
  if(!meta.exception) return;
  const err = meta.handle();
  // console.warn(err);
})

const preventOnError = reflect.advice(meta => {
  if(meta.method.toString().includes("Error")) meta.prevent();
})

const Person = createClass({
  sayHello: [function() {
    throw new Error("sayHello err");
  }, onException],
  sayHollo: [function() {
    throw new Error("sayHollo err");
  }],
  sayHallo() {
    throw new Error("sayHallo err");
  },
  sayHellio: [preventOnError, function() {
    throw new Error("sayHellio err");
  }]
});

let personInstance;

describe("exception handling advice", () => {
  beforeEach(() => {
    personInstance = new Person;
  })

  it("Check error throw on invocation", () => {
    personInstance.sayHello();
    expect(personInstance.sayHollo).toThrow(Error);
    expect(personInstance.sayHallo).toThrow(Error);
  });

  it("meta.prevent should avoid main method execution", () => {
    personInstance.sayHellio();
  })

})
