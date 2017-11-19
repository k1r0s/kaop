function advice(fn){
  fn.advice = 1;
  return fn;
}

module.exports = advice;
