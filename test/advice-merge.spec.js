const { createClass, reflect } = require('../');

const Delay = secs => reflect.advice(meta => setTimeout(meta.commit, secs));

const SoMuchDelay = [Delay(1000), Delay(1000), Delay(1000)];

const Car = createClass({

  startEngine: [...SoMuchDelay, Delay(5), function(cbk){
    cbk();
  }]

})

let carInstance;

describe("advance reflect.advice specs", () => {
  beforeAll(() => {
    carInstance = new Car;
  })

  it("Delay advice should stop the execution", done => {
    const time = Date.now();
    carInstance.startEngine(function() {
      expect(Date.now() - time).toBeGreaterThan(3000);
      expect(Date.now() - time).toBeLessThan(3100);
      done();
    });
  });
})
