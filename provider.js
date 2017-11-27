module.exports = {
  factory: function(_type){
    return function () {
      return new _type;
    }
  },
  singleton: function(_type) {
    var instance;
    return function () {
      if (!instance) instance = new _type;
      return instance;
    }
  }
};
