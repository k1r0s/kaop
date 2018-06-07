const utils = require("./utils");

function factory(targetClass){
  return function () {
    return utils.createInstance(targetClass, Array.prototype.slice.call(arguments));
  }
}

function singleton(targetClass) {
  let instance;
  return function () {
    if (!instance) instance = utils.createInstance(targetClass, Array.prototype.slice.call(arguments));
    return instance;
  }
}

module.exports = {
  factory: factory,
  singleton: singleton
};
