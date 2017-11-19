var advice = require("./advice");

var override = advice(function(meta) {
  meta.args.unshift(meta.target.super.prototype[meta.key].bind(meta.scope));
});

module.exports = override;
