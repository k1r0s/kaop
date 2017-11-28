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
  $evt: null,
  constructor: [inject.param(EventEmitterProvider), function(evtInstance) {
    this.$evt = evtInstance;
  }],
  onChange: function(cbk) {
    this.$evt.when("update", cbk.bind(this));
  },
  push: [override.apply, function() {
    this.$evt.force("update");
  }],
  pop: [override.apply, function() {
    this.$evt.force("update");
  }]
});

var list;

describe("inject specs", () => {
  beforeEach(() => {
    list = new ObservableArray;
  });

  it("should be able to inject dependencies", () => {
    expect(list.$evt).toBeInstanceOf(EventEmitter);
  });

  it("injected instance should have full capabilities", done => {
    list.onChange(function(){
      expect(this[0]).toEqual(42);
      done();
    });

    list.push(42);
  });
});
