module.exports = annotations = {
  arr: [
    function $override(opts){
      opts.args.unshift(opts.parentScope[opts.methodName].bind(opts.scope))
      return opts.method.apply(opts.scope, opts.args)
    }
  ],
  add: function(ann){
    this.arr.push(ann)
  },
  names: function(){
    return this.arr.map(function(fn){
      return fn.name
    })
  },
  getAnnotation: function(annotationName){
    for (var i = 0; i < this.arr.length; i++) {
      if(this.arr[i].name === annotationName){
        return this.arr[i]
      }
    }
  },
  compile: function(superClass, propertyName, propertyValue){
    if(!(
      propertyValue &&
      typeof propertyValue.length === "number" &&
      typeof propertyValue[propertyValue.length - 1] === "function" &&
      propertyValue.filter(function(e, index, arr){ return index !== arr.length - 1}).every(this.getAnnotation, this)
    )){
      return propertyValue
    }

    var annotatedMethod = this.getAnnotation(propertyValue[0])

    return function(){
      return annotatedMethod({
        scope: this,
        parentScope: superClass.prototype,
        method: propertyValue,
        methodName: propertyName,
        args: Array.prototype.slice.call(arguments)
      })
    }
  }
}
