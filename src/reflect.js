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

function createProxyFn(target, key, functionStack, customInvoke) {
  return function() {
    let adviceIndex = -1;
    function skip () {
      adviceIndex = functionStack.findIndex(utils.isMethod) - 1;
    }
    function handle () {
      const ext = adviceMetadata.exception;
      delete adviceMetadata.exception;
      return ext;
    }
    function prevent () {
      adviceMetadata.prevented = true;
    }
    function commit () {
      const append = Array.prototype.slice.call(arguments);
      adviceMetadata.args.push.apply(adviceMetadata.args, append);

      adviceIndex++;
      if (functionStack[adviceIndex]) {
        const currentEntry = functionStack[adviceIndex];
        if (!utils.isMethod(currentEntry)) {
          currentEntry.call(undefined, adviceMetadata);
        } else if (!adviceMetadata.prevented) {
          try {
            if(customInvoke) {
              var nscope = customInvoke(adviceMetadata);
              Object.assign(nscope, adviceMetadata.scope);
              adviceMetadata.result = adviceMetadata.scope = nscope;
            } else {
              adviceMetadata.result = currentEntry.apply(adviceMetadata.scope, adviceMetadata.args);
            }
          } catch (e) {
            adviceMetadata.exception = e;
          }
        }
        if (!utils.isAsync(currentEntry)) adviceMetadata.commit();
      } else {
        if(adviceMetadata.exception) throw adviceMetadata.exception;
      }
    }

    const adviceMetadata = {
      args: Array.prototype.slice.call(arguments),
      scope: this,
      key: key,
      method: utils.getMethodFromArraySignature(functionStack),
      target: target,
      ES6newTarget: new.target,
      exception: undefined,
      prevented: undefined,
      result: undefined,
      commit,
      prevent,
      handle,
      skip
    }

    commit();

    return adviceMetadata.result;
  }
}

module.exports = {
  advice: advice,
  aspect: aspect,
  wove: wove,
  createProxyFn: createProxyFn,
};
