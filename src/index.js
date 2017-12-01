const main = require("./main");
const override = require("./override");
const inject = require("./inject");
const provider = require("./provider");
const reflect = require("./reflect");

module.exports = {
  createClass: main.createClass,
  extend: main.extend,
  clear: main.clear,
  override: override,
  inject: inject,
  provider: provider,
  reflect: reflect
};
