function factory(targetClass){
  return function () {
    return new targetClass;
  }
}

function singleton(targetClass) {
  var instance;
  return function () {
    if (!instance) instance = new targetClass;
    return instance;
  }
}

module.exports = {
  factory: factory,
  singleton: singleton
};
