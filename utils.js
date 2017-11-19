function wove(target, props){
  var woved = Object.assign({}, props);

  for (var key in woved) {
    if(woved[key] instanceof Array && isValidArraySignature(woved[key])) {
      woved[key] = createProxyFn(target, key, woved[key]);
    }
  }
  return woved;
}

function createProxyFn(target, key, adviceList) {
  var adviceIndex = -1;
  return function() {

    function commitNext() {
      adviceIndex++;
      if (adviceList[adviceIndex]) {
        if (!isMethod(adviceList[adviceIndex])) {
          adviceList[adviceIndex](adviceMetadata);
          if (!isAsync(adviceList[adviceIndex])) adviceMetadata.commit();
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
      method: getMethodFromArraySignature(adviceList),
      target: target,
      result: undefined,
      commit: commitNext
    };

    commitNext();

    return adviceMetadata.result;
  }
}

function isMethod(fn) {
  return !fn.advice
}

function isValidArraySignature(ff) {
  return ff.every(function(fn) { return typeof fn === "function" }) &&
  ff.filter(isMethod).length === 1;
}

function getMethodFromArraySignature(adviceList) {
  return adviceList.find(isMethod);
}

function createInstance(_type) {
  var object = new _type;
  return object;
}

function isAsync(rawAdvice) {
  return !!rawAdvice.toString().match(/[a-zA-Z$_]\.commit/);
}

module.exports = {
  wove: wove,
  createProxyFn: createProxyFn,
  isMethod: isMethod,
  isValidArraySignature: isValidArraySignature,
  getMethodFromArraySignature: getMethodFromArraySignature,
  isAsync: isAsync,
  createInstance: createInstance
}
