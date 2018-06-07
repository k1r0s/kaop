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

function createInstance(_type, args) {
  args.unshift(null)
  return new (Function.prototype.bind.apply(_type, args));
}

function isAsync(rawAdvice) {
  return !!rawAdvice.toString().match(/[a-zA-Z$_]\.commit/);
}

module.exports = {
  isMethod: isMethod,
  isValidArraySignature: isValidArraySignature,
  getMethodFromArraySignature: getMethodFromArraySignature,
  isAsync: isAsync,
  createInstance: createInstance
}
