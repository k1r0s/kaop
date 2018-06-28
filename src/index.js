const main = require("./main");
const override = require("./override");
const inject = require("./inject");
const provider = require("./provider");
const reflect = require("./reflect");

module.exports.createClass = main.createClass;
module.exports.extend = main.extend;
module.exports.clear = main.clear;

module.exports.override = override;
module.exports.inject = inject;
module.exports.provider = provider;
module.exports.reflect = reflect;
