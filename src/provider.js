const utils = require("./utils");

function factory(targetClass){
  return function () {
    return utils.createInstance(targetClass, Array.prototype.slice.call(arguments));
  }
}

function singleton(targetClass) {
  let instance;
  return function () {
    const args = Array.prototype.slice.call(arguments);
    if (!instance) instance = utils.createInstance(targetClass, args);
    return instance;
  }
}

module.exports = {
  factory: factory,
  singleton: singleton
};
