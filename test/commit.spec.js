const { createClass, reflect } = require('../');

const FetchSomethingAsync = reflect.advice(meta =>
  setTimeout(() => meta.commit("async", "data"), 10));

const methodMock = jest.fn();

const Service = createClass({

  getSomething: [
    FetchSomethingAsync,
    methodMock
  ]
})

let serviceInstance;

describe("commit advice should be able to receive arguments and append to meta.args", () => {
  beforeAll(() => {
    serviceInstance = new Service;
  })

  it("cbk function should be used to inspect received arguments by the main method:getSomething", done => {
    serviceInstance.getSomething();

    setTimeout(() => {
      expect(methodMock.mock.calls[0].join(" ")).toBe("async data");
      done();
    }, 20)
  });

})
