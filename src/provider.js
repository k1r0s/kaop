const utils = require("./utils");

function factory(targetClass){
  return function () {
    return utils.createInstance(targetClass);
  }
}

function singleton(targetClass) {
  let instance;
  return function () {
    if (!instance) instance = utils.createInstance(targetClass);
    return instance;
  }
}

module.exports = {
  factory: factory,
  singleton: singleton
};
