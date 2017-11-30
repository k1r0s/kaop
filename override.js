const reflect = require("./reflect");

const apply = reflect.advice(function(meta) {
  meta.target.super.prototype[meta.key].apply(meta.scope, meta.args);
});

const implement = reflect.advice(function(meta) {
  meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
});

module.exports = {
  apply: apply,
  implement: implement
}
