var reflect = require("./reflect");

function args(){
  var providers = Array.prototype.slice.call(arguments);
  return reflect.advice(function(meta) {
    if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
    meta.args = providers.map(function(provider) { return provider() });
  })
}

function assign(dependencies) {
  return reflect.advice(function(meta){
    for (var propName in dependencies) {
      var provider = dependencies[propName];
      meta.scope[propName] = provider();
    }
  });
}

module.exports = {
  args: args,
  assign: assign
}
