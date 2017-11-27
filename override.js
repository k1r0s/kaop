var advice = require("./advice");

module.exports = {
  apply: advice(function(meta) {
    meta.target.super.prototype[meta.key].apply(meta.scope, meta.args);
  }),
  get: advice(function(meta) {
    meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
  })
}
