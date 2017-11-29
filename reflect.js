var utils = require("./utils");

function advice(fn){
  fn.advice = 1;
  return fn;
}

function aspect(fn){
  return function(props) {
    return Object.keys(props).reduce(fn, props)
  };
};

function wove(target, props){
  var woved = Object.assign({}, props);

  for (var key in woved) {
    if(woved[key] instanceof Array && utils.isValidArraySignature(woved[key])) {
      woved[key] = createProxyFn(target, key, woved[key]);
    }
  }
  return woved;
}

function createProxyFn(target, key, adviceList) {
  return function() {
    var adviceIndex = -1;
    function commitNext() {
      adviceIndex++;
      if (adviceList[adviceIndex]) {
        if (!utils.isMethod(adviceList[adviceIndex])) {
          adviceList[adviceIndex].call(undefined, adviceMetadata);
          if (!utils.isAsync(adviceList[adviceIndex])) adviceMetadata.commit();
        } else {
          adviceMetadata.result = adviceList[adviceIndex].apply(adviceMetadata.scope, adviceMetadata.args);
          adviceMetadata.commit();
        }
      }
    }

    var adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: utils.getMethodFromArraySignature(adviceList),
      target: target,
      result: undefined,
      commit: commitNext,
      break: function() { this.commit = function() {} }
    };

    commitNext();

    return adviceMetadata.result;
  }
}

module.exports = {
  advice: advice,
  aspect: aspect,
  wove: wove,
  createProxyFn: createProxyFn,
};
