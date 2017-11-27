var advice = require("./advice");

module.exports = {
  param: function(){
    var providers = Array.prototype.slice.call(arguments);
    return advice(function(meta) {
      if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
      meta.args = providers.map(function(provider) { return provider() });
    })
  },
  assign: function(dependencies) {
    return advice(function(meta){
      for (var propName in dependencies) {
        var provider = dependencies[propName];
        meta.scope[propName] = provider();
      }
    });
  }
}
