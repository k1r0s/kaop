var annotations = require("./annotations")

module.exports = extend = function(sourceClass, extendedProperties){

  var inheritedProperties = {}

  for(var propertyName in sourceClass.prototype){
    inheritedProperties[propertyName] = sourceClass.prototype[propertyName]
  }

  for(var propertyName in extendedProperties){
    extendedProperties[propertyName] = annotations.compile(sourceClass, propertyName, extendedProperties[propertyName])
  }

  var extendedClass = function(){
    if(typeof this.constructor === "function") this.constructor.apply(this, arguments)
  }

  extendedClass.rawProperties = extendedProperties
  extendedClass.prototype = inheritedProperties
  return extendedClass
}
