const { createClass, reflect } = require('../');

const delay = reflect.advice(meta => setTimeout(meta.commit, 10));
const handleError = reflect.advice(meta => meta.handle());

const Dummy = createClass({
  do1: [delay, function() {
    return Promise.resolve(10)
  }],
  do2: [function() {
    return Promise.resolve(10)
  }],
  do3: [delay, function() {
    throw new Error("lmaooo")
  }],
  do4: [delay, function() {
    throw new Error("lmaooo")
  }, handleError]
})

let instance;
describe("promise based advice", () => {
  beforeAll(() => {
    instance = new Dummy;
  })

  it("decorator should be able to return original value despite being wrapped by an asynchronous advice", () => {
    return instance.do1().then(num => expect(num).toBe(10));
  })

  it("method should be independent from advices", () => {
    return instance.do2().then(num => expect(num).toBe(10));
  })

  it("method should return a promise that rejects", () => {
    return instance.do3().catch(err => expect(err.message).toBe("lmaooo"));
  })

  it("should be able to work as spected when handling exceptions", () => {
    return instance.do4();
  })
});
