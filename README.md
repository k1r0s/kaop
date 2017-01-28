# kaop

![Image travis]
(https://api.travis-ci.org/ciroreed/kaop.svg?branch=master)

update: a detailed [brew showcase](https://github.com/ciroreed/kaop/blob/master/test/showcase.js) is included in test dir.

This library has a lot of combinations. There are more than 25 examples running at `test` dir... This description try to explain some basic concepts. Advanced users probably will not find too much help about its capabilities.

Kaop is a light package to provide OOP/AOP patterns, which enables several features such save code, enhance readability, and also provide an alternative to use the lowest JS version (in browsers world) with top features:

## Contents

- [Classes and inheritance](#classes-and-inheritance)
- [Method decorators](#method-decorators)

### Classes and Inheritance

```javascript
var Class = require("kaop").Class
```

-`Class(properties)` is a function which returns a fn constructor that implements defined properties as a class definition.

-`Class.inherits(SuperClass, SubClass properties)` extend the SuperClass properties replacing if they have the same key/name.. we can override methods with the built in decorator `override` (recursively through upper classes (trust me!)).

-`Class.static(properties)` returns a plain object with the given properties like plain JavaScript does, we may use this only to enable Decorators.

```javascript
var Person = Class({
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
To create a new instance from Person we need to to this:

```javascript
// new Person
var simplePerson = new Person("Joe", new Date(1990))
// simplePerson.name outputs > "Joe"
// simplePerson.getAge outputs > 26 (coz howadays we're in 2016)

```
Now we're going to extend `Person` to another subClass called `Programmer`:

```javascript
Programmer = Class.inherits(Person, {
  //decorators override inject the SuperClass.constructor as the first parameter
  constructor: ["override", function(parent, name, dborn, favouriteLanguage){
    parent(name, dborn) //calling it we can save a lot of code
    this.favLang = favouriteLanguage
  }],
  run: ["override", function(parent){ //we simply override it to change the behavior
    return parent() + " but... not as faster, coz im fat :/"
  }],
  code: function(){ //new method for Programmer instances
    return "Im codding in " + this.favLang
  }
})
```
As you may wonder Programmer `constructor` overrides super (or parent) constructor following the OOP criteria. So each time we create an instance of Programmer we're calling parent constructor.

> Note that if you declare a constructor in subClass you must override the parent constructor. If u dont override it, may we receive an unespected behavior (if you dont override it u're just replacing the parent constructor, so it may work, but ... probably is not what you want :|).

Note that we're using `override` decorator to get superClass method in the subClass method, if we remove the override from the method we're just replacing the method, so be aware of this!.

### Method decorators

```javascript
var Decorators = require("kaop").Decorators
```
`Decorators.add(function decoratorName(){  ....  })` provides a way to add new features to your app, Decorators can modify class methods.

Having this one:
```javascript
Decorators.add(function jsonStringify(){
  this.place(function(opts, next){
    opts.result = JSON.stringify(opts.scope);
    next();
    //or this.next()
  })
})
```
And then:
```javascript
CoolProgrammer = extend(Programmer, {
  constructor: ["override", function(parent, name, dborn, favouriteLanguage){ //method recursive override
    parent(name, dborn, favouriteLanguage)
  }],
  run: function(){ //parent method replacement
    return "IM FAST AS HELL!! GET OUT OF MY WAY!"
  },
  serialize: [function(){
      //some stuff
      //
      // ...
  }, "jsonStringify"]
})
```
Note that in the previous sample there is a `serialize` method that has `jsonStringify` decorator (placed at the end of the declaration, so it will be executed AFTER method execution)...

> NOTE! decorators could be placed at the beginning or at the end. This is optional because you always can use hooks in decorator declaration. A method can be decorated multiple times and decorators can support multiple hooks within. Anyway you can place decorators at some possition to be more dynamic when declare new classes.
So the following code does this:

```javascript
var coolp = new CoolProgrammer("Jon Doe", new Date(1990, 8, 22), "Javascript")
coolp.serialize() //outputs a string with the serialized instance..
```

### YOLO

As you may wonder Decorators support **chained** asynchronous calls because they are callback driven.

Multiple Decorators for the same method are allowed. You might use hooks inside decorator declaration to control when the decorator will be executed, you can also define multiple hooks in the same decorator:

> NOTE! to use custom objects/services (user defined variables) inside Decorators you must define it as properties of Decorators::locals. IE: var myCoolService = {cool: 'stuff'}; and then you try to use that inside an decorator it will give an reference error unless you do Decorators.locals.myCoolService = myCoolService.  

```javascript
Decorators.add(function save(index){
  // hooks
  // this.before(function(opts, next){
  // this.after(function(opts, next){
  // this.place(function(opts, next){
  // this.first(function(opts, next){
  // this.last(function(opts, next){
  this.after(function(opts, next){
    //this method will be executed AFTER the annotated method return it result, so we can
    //perform several actions with it (with the result or what ever is defined in the
    //method)

    // stuff...

    opts.args //contains the arguments or parameters that the method receives
    opts.result //contains the returned value
    opts.scope //it used to be `this` inside the method, so its the instance itself
    opts.parentScope //gives you access to the parent prototype or.. how `override` works
    opts.method //it will be executed after all the befores hooks have been consumed
    opts.methodName //the method name string, for tracking purposes.. or any
    opts.preventExecution //if we asign a truthy value in `before` phase, decorated method will not be called

    next() //MANDATORY call next. When called, next hook or action will trigger..
    // stuff...

    // asynchronous example
    myService.post("myEndPoint").success(function(){
      // stuff...
      next() //so the next execution wait until next is called
    })
  })
})
```

#TODO
- document the framework
...
