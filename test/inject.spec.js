var type = require('../');
var inject = require('../inject');
var provide = require('../provider');
var override = require('../override');

var EventEmitter, EventEmitterProvider = provide.factory(EventEmitter = type({
  actions: [],
  when: function(uid, handler) {
    this.actions.push({ uid, handler });
  },
  force: function(uid, data) {
    var matched = this.actions.find(action => action.uid === uid)

    matched && matched.handler.call(undefined, data);
  },
  ignore: function(uid) {
    this.actions = this.actions.filter(action => action.uid !== idEvent);
  }
}));

var ObservableArray = type.inherits(Array, {
  $obs: null,
  constructor: [inject.param(EventEmitterProvider), function(obs) {
    this.$obs = obs;
  }],
  onChange: function(cbk) {
    this.$obs.when("update", cbk.bind(this));
  },
  push: [override.apply, function() {
    this.$obs.force("update");
  }],
  pop: [override.apply, function() {
    this.$obs.force("update");
  }]
});

var list;

describe("inject specs", () => {
  beforeEach(() => {
    list = new ObservableArray;
  });

  it("should be able to inject dependencies", () => {
    expect(list.$obs).toBeInstanceOf(EventEmitter);
  });

  it("injected instance should have full capabilities", done => {
    list.onChange(function(){
      expect(this[0]).toEqual(42);
      done();
    });

    list.push(42);
  });
});
