function singleton(_type) {
  var instance;
  return function () {
    if (!instance) instance = new _type;
    return instance;
  }
}

module.exports = singleton;
