module.exports = annotations = {
  arr: [
    function $override(){
      this.before(function(opts, next){
        opts.args.unshift(opts.parentScope[opts.methodName].bind(opts.scope))
        next()
      })
    }
  ],
  locals: {},
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
  Store: function(opts){
    var befores = []
    var afters = []
    this.before = function(fn){ befores.push(fn) }
    this.after = function(fn){ afters.push(fn) }
    this.next = function(){
      var nextBeforeFn = befores.shift()
      if(nextBeforeFn){
        nextBeforeFn.call(this, opts, arguments.callee)
      }
      opts.result = opts.method.apply(opts.scope, opts.args)
      var nextAfterFn = afters.shift()
      if(nextAfterFn){
        nextAfterFn.call(this, opts, arguments.callee)
      }
    }
  },
  fireMethodAnnotations: function(annotations, storeInstance, locals){
    for (var i = 0; i < annotations.length; i++) {

      var preparedAnnotation = annotations[i].split(":")
      var annotationFn = this.getAnnotation(preparedAnnotation[0])
      var annotationArguments = preparedAnnotation[1]

      with(locals){
        if(annotationArguments){
          eval("(" + annotationFn + ".call(storeInstance, " + annotationArguments + "))")
        }else{
          eval("(" + annotationFn + ".call(storeInstance))")
        }
      }
    }
  },
  getMethodAnnotations: function(array){
    return array.filter(function(e, index, arr){ return index !== arr.length - 1})
  },
  isValidAnnotationArray: function(array){
    return this.getMethodAnnotations(array)
    .map(function(item){ return item.split(":").shift() })
    .every(this.getAnnotation, this)
  },
  compile: function(superClass, propertyName, propertyValue){
    if(!(
      propertyValue &&
      typeof propertyValue.length === "number" &&
      typeof propertyValue[propertyValue.length - 1] === "function" &&
      this.isValidAnnotationArray(propertyValue)
    )){
      return propertyValue
    }

    var selfAnnotations = this

    return function(){

      var opts = {
        scope: this,
        parentScope: superClass.prototype,
        method: propertyValue[propertyValue.length - 1],
        methodName: propertyName,
        args: Array.prototype.slice.call(arguments),
        result: undefined
      }

      var store = new selfAnnotations.Store(opts)

      var methodAnnotations = selfAnnotations.getMethodAnnotations(propertyValue)

      selfAnnotations.fireMethodAnnotations(methodAnnotations, store, selfAnnotations.locals)

      store.next()

      return opts.result
    }
  }
}
