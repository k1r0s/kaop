var type = require('../');
var inject = require('../inject');
var provide = require('../provider');
var override = require('../override');

var Observable = provide.factory(type({
  actions: [],
  subscribe: function(uid, handler) {
    this.actions.push({ uid, handler });
  },
  trigger: function(uid, data) {
    var matched = this.actions.find(action => action.uid === uid)

    matched && matched.call(undefined, data)
  },
  unsubscribe: function(uid) {
    this.actions = this.actions.filter(action => action.uid !== idEvent);
  }
}))

var RemoteCollection = type.inherits(Array, {
  $obs: null,
  constructor: [inject.param(Observable), (obs) => {
    this.$obs = obs;
  }],
  push: [override.apply, () => {
    this.$obs.trigger("update");
  }],
  pop: [override.apply, () => {
    this.$obs.trigger("update");
  }],
  unshift: [override.apply, () => {
    this.$obs.trigger("update");
  }],
  shift: [override.implement, () => {
    this.$obs.trigger("update");
  }]
});

var list1, list2;

describe("advice specs", () => {
  beforeEach(() => {
    list1 =  new Array;
    list2 =  new CustomList;
  });

  it("should be able to call custom actions without messing proto behavior", () => {
    list2.push(3, 4);
    list1.push(3, 4);
    expect(list1[1]).toEqual(list2[1]);
    list2.pop();
    list1.pop();
    expect(list1[1]).toEqual(list2[1]);
  });

  it("extended type should be able keep original behavior featuring new things", () => {
    list2.push(3, 4);
    list2.unshift(9);
    list2.push(5, 4, 7, 7);
    expect(list2.total).toEqual(39);
    list2.pop();
    list2.shift();
    list2.push(3);
    list2.push(9);
    expect(list2.total).toEqual(35);
  });
});
