### k-oop

this library is a light package to provide OOP utils save code, enhance code readability, and also provide an alternative to use the lowest JS version with OOP features:

**Extend**

```javascript
var extend = require("k-oop").extend
```

`extend(super, properties)` is a function which returns a constructor that inherits all the super properties and then **extends** it with the given properties or methods in the `properties` parameter.

```javascript
var Person = extend(function(){}, {
  constructor: function(name, dborn){
    this.name = name
    this.dborn = dborn
  },
  run: function(){
    return "Im running!"
  },
  getAge: function(){
    var currentYear = new Date().getFullYear()
    var yearBorn = this.dborn.getFullYear()
    return currentYear - yearBorn
  }
})
```  
> NOTE! *extend* first parameter is `function(){}` because Person class does not extends from any, we're simply creating a class from scratch

To create a new instance from Person we need to to this:

```javascript
// new Person
var simplePerson = new Person("Joe", new Date(1990))
// simplePerson.name outputs > "Joe"
// simplePerson.getAge outputs > 26 (coz howadays we're in 2016)

```
Now we're going to extend `Person` to another subClass called `Programmer`:

```javascript
var Programmer = extend(Person, {
  constructor: function $override(parent, name, dborn, favouriteLanguage){
    parent(name, dborn)
    this.favLang = favouriteLanguage
  },
  run: function $override(parent){
    return parent() + " but... not as faster, coz im fat :/"
  },
  code: function(){
    return "Im codding in " + this.favLang
  }
})
```
As you may wonder Programmer `constructor` overrides super (or parent) constructor following the OOP criteria. So each time we create an instance of Programmer we're calling parent constructor.

> Note that if you declare a constructor in subClass you must override the parent constructor. If we dont override it, may we receive an unespected behavior.

Note that we're using `$override` annotation to get superClass method in the subClass method, if we remove the $override from the method we're just replacing the method, so be aware of this!.

**Annotations**

```javascript
var annotations = require("k-oop").annotations
```
`annotations.add(annotationFn)` provides a way to add new features to your app, annotations can modify class methods.

Having this one:
```javascript
annotations.add(function $twice(opts){
  return opts.method() + opts.method()
})
```
And then:
```javascript
var CoolProgrammer = extend(Programmer, {
  run: function(){
    return "IM FAST AS HELL!! GET OUT OF MY WAY!"
  },
  fly: function $twice(){
    return "yay drugs! "
  }
})
```
> You can only add one annotation per method (this may change in the near future)

Note that in the previous sample there is a `fly` method that has `$twice` annotation...

So the following code does this:

```javascript
var i = new CoolProgrammer("Ciro", new Date(1990, 8, 22), "Javascript")
i.fly() //outputs > "yay drugs! yay drugs! "
```

the `opts` parameter for the annotation definition has the following properties:

*scope* (opts.scope) this is the current instance/scope where method is executed
*parentScope* (opts.parentScope) proto is the superClass instance
*method* (opts.method) otherProperties[methodName] is the method who contains the annotation
*methodName* (methodName) methodName is the name of the property where the method is evaluated
*args* (arguments object parsed to native Array)
