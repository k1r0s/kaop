const base = require('../');
const inject = require('../inject');
const provide = require('../provider');
const override = require('../override');

const EventEmitter = base.createClass({
  actions: [],
  when: function(uid, handler) {
    this.actions.push({ uid, handler });
  },
  force: function(uid, data) {
    const matched = this.actions.find(action => action.uid === uid)

    matched && matched.handler.call(undefined, data);
  },
  ignore: function(uid) {
    this.actions = this.actions.filter(action => action.uid !== idEvent);
  }
});

const EventEmitterProvider = provide.factory(EventEmitter);

const SomeService = base.createClass({
  store: null,
  constructor: function() {
    this.store = {};
  },
  get: function(key){
    return this.store[key];
  },
  set: function(key, val){
    return this.store[key] = val;
  }
});

const SomeServiceProvider = provide.singleton(SomeService);
const AnotherServiceProvider = provide.factory(SomeService);

const ObservableArray = base.extend(Array, {
  constructor: [
    inject.args(
      EventEmitterProvider,
      SomeServiceProvider,
      AnotherServiceProvider
    ),
    function(evtInstance, serInstance, anserInstance) {
      this.$evt = evtInstance;
      this.$ser = serInstance;
      this.$anser = anserInstance;
    }
  ],
  onChange: function(cbk) {
    this.$evt.when("update", cbk.bind(this));
  },
  push: [override.apply, function() {
    this.$evt.force("update");
  }]
});

const DummyModel = base.createClass({
  constructor: [
    inject.assign({
      $evt: EventEmitterProvider,
      $ser: SomeServiceProvider,
      $anser: AnotherServiceProvider
    }),
    function() {}
  ]
});

let list, model;

describe("inject specs", () => {
  beforeEach(() => {
    list = new ObservableArray;
    model = new DummyModel;
  });

  it("should be able to inject dependencies", () => {
    expect(list.$evt).toBeInstanceOf(EventEmitter);
    expect(model.$evt).toBeInstanceOf(EventEmitter);
    expect(model.$ser).toBeInstanceOf(SomeService);
    expect(list.$ser).toBeInstanceOf(SomeService);
  });

  it("injected instance should have full capabilities", done => {
    list.onChange(function(){
      expect(this).toBeInstanceOf(Array);
      expect(this).toBeInstanceOf(ObservableArray);
      expect(this.pop()).toEqual(42);
      done();
    });

    list.push(42);
  });

  it("injected singletons are restricted as a one instance", () => {
    model.$ser.set("test", "this is a test");
    list.$ser.set("test", "this is another test");

    expect(model.$ser.get("test")).toEqual("this is another test");
  });

  it("injected factories NOT are restricted to one instance", () => {
    model.$anser.set("test", "this is a test");
    list.$anser.set("test", "this is another test");

    expect(model.$anser.get("test")).toEqual("this is a test");
  });

});
