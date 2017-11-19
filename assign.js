var advice = require("./advice");

var assign = function(dependencies) {
  return advice(function(meta){
    for (var propName in dependencies) {
      var provider = dependencies[propName];
      meta.scope[propName] = provider();
    }
  });
}

module.exports = assign;
