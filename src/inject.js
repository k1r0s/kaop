const reflect = require("./reflect");

function args(){
  const providers = Array.prototype.slice.call(arguments);
  return reflect.advice(function(meta) {
    if (meta.key !== "constructor") { throw new Error("inject only available in constructor") }
    providers.forEach(function(provider) { meta.args.push(provider()) });
  })
}

function assign(dependencies) {
  return reflect.advice(function(meta){
    for (const propName in dependencies) {
      const provider = dependencies[propName];
      meta.scope[propName] = provider();
    }
  });
}

module.exports = {
  args: args,
  assign: assign
}
