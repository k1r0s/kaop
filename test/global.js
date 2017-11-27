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

    matched && matched.handler.call(undefined, data);
  },
  unsubscribe: function(uid) {
    this.actions = this.actions.filter(action => action.uid !== idEvent);
  }
}))

var RemoteCollection = type.inherits(Array, {
  $obs: null,
  constructor: [inject.param(Observable), function(obs) {
    this.$obs = obs;
  }],
  onChange: function(cbk) {
    this.$obs.subscribe("update", cbk.bind(this));
  },
  push: [override.apply, function() {
    this.$obs.trigger("update");
  }],
  pop: [override.apply, function() {
    this.$obs.trigger("update");
  }],
  unshift: [override.apply, function() {
    this.$obs.trigger("update");
  }],
  shift: [override.implement, function() {
    this.$obs.trigger("update");
  }]
});

var list = new RemoteCollection;

list.onChange(function(){ console.log("changed", this); });

list.push(2, 3);
