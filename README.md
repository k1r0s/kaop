# kaop

[![Image travis](https://travis-ci.org/k1r0s/kaop.svg?branch=master)](https://travis-ci.org/k1r0s/)
[![version](https://img.shields.io/npm/v/kaop.svg)](https://www.npmjs.com/package/kaop/)
[![Coverage Status](https://coveralls.io/repos/github/k1r0s/kaop/badge.svg?branch=master)](https://coveralls.io/github/k1r0s/kaop)
[![dependencies](https://david-dm.org/k1r0s/kaop/status.svg)](https://david-dm.org/k1r0s/kaop/status.svg)
[![dev-dependencies](https://david-dm.org/k1r0s/kaop/dev-status.svg)](https://www.npmjs.com/package/kaop)
[![downloads](https://img.shields.io/npm/dm/kaop.svg)](https://www.npmjs.com/package/kaop)

Kaop is a light package to provide OOP/AOP patterns, also provide an alternative to use the lowest JS version (in browsers world) with top features:
---
[Kaop alpha TS version](https://github.com/k1r0s/kaop-ts) using ES7 decorators

[MUST SEE](https://k1r0s.github.io/aop-intro/)

update: a detailed [brew showcase](https://github.com/ciroreed/kaop/blob/master/test/showcase.js) is included in test dir.

Bring the benefits of AOP to Javascript: https://en.wikipedia.org/wiki/Aspect-oriented_programming

This library is a ground tool-kit to enhance code design in JS, using decorator pattern.

Here I try to explain some basic concepts:

## Contents

- [Classes and Inheritance](#classes-and-inheritance)
- [Method Advices](#method-advices)

### Classes and Inheritance (why use Babel)

```javascript
var Class = require("kaop").Class
```
-`Class(properties)` is a function which returns a fn constructor that implements defined properties as a class definition.

-`Class.inherits(SuperClass, SubClass properties)` extend the SuperClass properties replacing if they have the same key/name.. we can override methods with the built in decorator `override` (recursively through upper classes (trust me!)).

-`Class.static(properties)` returns a plain object with the given properties like plain JavaScript does, we may use this only to enable Advices.

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
// simplePerson.getAge outputs > 27 (coz howadays we're in 2017)

```
Now we're going to extend `Person` to another subClass called `Programmer`:

```javascript
Programmer = Class.inherits(Person, {
  //Advices override inject the SuperClass.constructor as the first parameter
  constructor: ["override", function(parent, name, dborn, favouriteLanguage){
    parent(name, dborn) //like 'super()' does
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

Note that we're using `override` Advice to get superClass method in the subClass method, if we remove the override from the method we're just replacing the method, so be aware of this!.

### Method Advices

```javascript
var Advices = require("kaop").Advices
```
`Advices.add(function AdviceName(){  ....  })` provides a way to add new features to your app, Advices can modify class methods.

> The most boring example .. LOGS

```javascript
Advices.add(function log(){
    console.log(meta.methodName + " called");
    console.log("with arguments: " + meta.args);
    console.log("returned: " + meta.result);
})
```
And then:
```javascript
MyService = Class.static({
    myBorginOperation: [function(some, thing){
        // stuff...
        return some + thing;
    }, "log"]
})

```
> NOTE! The execution of the advice will depend on advice's
position (implementation). In previous example 'log' advice
is implemented right after method declaration (method stack), so
it will be executed after the method call.

```javascript
MyService.myBorginOperation(3, 54); //57
//logs:
// 'myBorginOperation called'
// with arguments: 3, 54
// returned: 57
```
... but most of our code base is often asynchronous, right?

You can stack advices over methods like this way:
```javascript
MyService = Class.static({
    myBorginOperation: ["myAsyncTask1", "myAsyncTask2", function(some, thing){
        // stuff...
        return some + thing;
    }]
})
```
You're used to declare 'next' callback in advice declaration, if you do so
the next advice in the callstack will be delayed until 'next' is called.

Imagine you have a service responsible to perform AJAX calls and you want
to apply IoC in your codebase:
```javascript
Advices.add(
    //we're going to skip how the service is used, just imagine that $$myAjaxService works
    function xhrGet(url){ //note that this advice can be parameterized
        $$myAjaxService.get(url + "/" + meta.args[0]) //url will be any string
        .then(function(response){ // success
            meta.args.push(response);
            // we get the response, but isn't the place to deal with it (*)
            next(); // dispatch the next advice, or method
        });
    }
)
```
In the previous example, we define an advice responsible to receive an argument,
then perform a request to get that resource/url..
when request is success it will place the response as the first parameter
and dispatch to the following advice or method.

```javascript
SomeBusinessTopic = Class({
    loadTaxes: ["xhrGet: '/taxes/'", function(country, taxes){
        //taxes is the response from the server
    }]
})
SomeBusinessTopic.loadTaxes('india'); //will perform a request GET: /taxes/india
```
The implementation is clear enough.

### YOLO

As you may wonder Advices support **chained** asynchronous calls because they are callback driven.

Multiple Advices for the same method are allowed. You might use hooks inside decorator declaration to control when the decorator will be executed, you can also define multiple hooks in the same decorator:

> NOTE! to use custom objects/services (user defined variables)
 inside Advices you must define it as properties of Advices::locals.
 IE: var myCoolService = {cool: 'stuff'}; and then you try to use
 that inside an decorator it will give an reference error unless you
 do Advices.locals.myCoolService = myCoolService.  

```javascript
Advices.add(
    function save(index){ //arguments are defined in implementation. 'save: 3'

        meta.args //contains the arguments or parameters that the method receives
        meta.result //contains the returned value
        meta.scope //it used to be `this` inside the method, so its the instance itself
        meta.parentScope //gives you access to the parent prototype or.. how `override` works
        meta.method //it will be executed after all the befores hooks have been consumed
        meta.methodName //the method name string, for tracking purposes.. or any
        //TODO: meta.preventExecution //check branch 'old-master'
        // if we asign a truthy value in `before` phase, main method will never be call

        next() // When called, next advice or method will be invoked..
        // if next is not defined the advice execution will be synchronous
        // stuff...


        // asynchronous example
        myService.post("myEndPoint").success(function(){
          // stuff...
          next(); //so the next execution wait until next is called
        })
    }
)
```

#TODO
- document the framework
...
