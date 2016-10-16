var annotations = require("./annotations")

module.exports = extend = function(sourceClass, extendedProperties){

  var inheritedProperties = {}

  for(var property in sourceClass.prototype){
    inheritedProperties[property] = sourceClass.prototype[property]
  }

  for(var property in extendedProperties){
    if(typeof extendedProperties[property] === "function" && annotations.getAnnotation(extendedProperties[property].name)){
      inheritedProperties[property] = annotations.delegate(sourceClass.prototype, property, extendedProperties)
    }else{
      inheritedProperties[property] = extendedProperties[property]
    }
  }

  var extendedClass = function(){
    if(typeof this.constructor === "function") this.constructor.apply(this, arguments)
  }

  extendedClass.prototype = inheritedProperties
  return extendedClass
}
