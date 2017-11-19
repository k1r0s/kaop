function factory(_type){
  return function () {
    return new _type;
  }
}

module.exports = factory;
