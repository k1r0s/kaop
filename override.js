var reflect = require("./reflect");

module.exports = {
  apply: reflect.advice(function(meta) {
    meta.target.super.prototype[meta.key].apply(meta.scope, meta.args);
  }),
  implement: reflect.advice(function(meta) {
    meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
  })
}
