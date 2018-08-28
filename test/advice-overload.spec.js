const { createClass, reflect } = require('../');
const assert = require('assert');

const Throws = (errorType, result) => reflect.advice(meta => {
  if(meta.exception && meta.exception instanceof errorType) {
    meta.result = result
    meta.handle()
  }
})

const Catch = [
  Throws(SyntaxError, 1),
  Throws(TypeError, 2),
  Throws(ReferenceError, 3)
];

const Car = createClass({

  willThrowSyntaxError: [function(){
    [...null]
  }, ...Catch],

  willThrowTypeError: [function(){
    null.ee
  }, ...Catch],

  willThrowReferenceError: [function(){
    aaa.eee()
  }, ...Catch]

})

let carInstance;

describe("advance reflect.advice specs", () => {
  beforeAll(() => {
    carInstance = new Car;
  })

  it("SyntaxError is thrown", () => {
    assert(carInstance.willThrowSyntaxError(), 1)
  });
  it("TypeError is thrown", () => {
    assert(carInstance.willThrowTypeError(), 2)
  });
  it("ReferenceError is thrown", () => {
    assert(carInstance.willThrowReferenceError(), 3)
  });
})
