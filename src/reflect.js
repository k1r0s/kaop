const utils = require("./utils");

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
  const woved = Object.assign({}, props);

  for (let key in woved) {
    if(woved[key] instanceof Array && utils.isValidArraySignature(woved[key])) {
      woved[key] = createProxyFn(target, key, woved[key]);
    }
  }
  return woved;
}

function createProxyFn(target, key, functionStack) {
  return function() {
    let adviceIndex = -1;
    function commitNext() {
      adviceIndex++;
      if (functionStack[adviceIndex]) {
        const currentEntry = functionStack[adviceIndex];
        if (!utils.isMethod(currentEntry)) {
          currentEntry.call(undefined, adviceMetadata);
          if (!utils.isAsync(currentEntry)) adviceMetadata.commit();
        } else {
          adviceMetadata.result = currentEntry.apply(adviceMetadata.scope, adviceMetadata.args);
          adviceMetadata.commit();
        }
      }
    }

    const adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: utils.getMethodFromArraySignature(functionStack),
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
