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
  delegate: function(proto, methodName, otherProperties){
    var annotatedMethod = this.getAnnotation(otherProperties[methodName].name)
    return function(){
      return annotatedMethod({
        scope: this,
        parentScope: proto,
        method: otherProperties[methodName],
        methodName: methodName,
        args: Array.prototype.slice.call(arguments)
      })
    }
  }
}
