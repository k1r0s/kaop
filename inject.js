var advice = require("./advice");

var inject = function(){
  var providers = Array.prototype.slice.call(arguments);
  return advice(function(meta) {
    if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
    meta.args = providers.map(function(provider) { return provider() });
  });
}

module.exports = inject;
