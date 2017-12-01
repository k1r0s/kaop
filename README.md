![kaop](http://i.imgur.com/6biEpsq.png)

[![version](https://img.shields.io/npm/v/kaop.svg)](https://www.npmjs.com/package/kaop/)
[![dependencies](https://david-dm.org/k1r0s/kaop/status.svg)](https://david-dm.org/k1r0s/kaop/status.svg)
[![dev-dependencies](https://david-dm.org/k1r0s/kaop/dev-status.svg)](https://www.npmjs.com/package/kaop)
[![downloads](https://img.shields.io/npm/dm/kaop.svg)](https://www.npmjs.com/package/kaop)
[![Known Vulnerabilities](https://snyk.io/test/npm/kaop/badge.svg)](https://snyk.io/test/npm/kaop)

Lightweight, solid, framework agnostic and **easy to use** library which provides reflection features to deal with *Cross Cutting Concerns* and improve modularity in your code.

### Features, from bottom to top.

- Better classes
- Inheritance
- Composition
- Override
- Dependency Injection
- Aspect Oriented Extensions

### Get started

```bash
npm install kaop --save
```

```javascript
import { extend } from 'kaop'

// Array.prototype.includes() polyfill
const MyArray = extend(Array, {
  includes(value) {
    return this.indexOf(value) > -1;
  }
});

const arr = new MyArray(1, 2, 3, 4);

arr.includes(2); // true
arr.includes(5); // false
```

Easy, right? lets try something else

```javascript
// create a spy function
const methodSpy = jest.fn();

const Person = createClass({
  constructor(name, yearBorn) {
    this.name = name;
    this.age = new Date(yearBorn, 1, 1);
  },

  // note that `sayHello` always calls `veryHeavyCalculation`
  veryHeavyCalculation: [Memoize.read, function() {
      // call spy function
      methodSpy();
      const today = new Date();
      return today.getFullYear() - this.age.getFullYear();
  }, Memoize.write],

  sayHello(){
    return `hello, I'm ${this.name}, and I'm ${this.veryHeavyCalculation()} years old`;
  }
})

// ... test it
it("cache advices should avoid 'veryHeavyCalculation' to be called more than once", () => {
  const personInstance = new Person("John Doe", 1990);
  personInstance.sayHello();
  personInstance.sayHello();
  personInstance.sayHello();
  expect(methodSpy).toHaveBeenCalledTimes(1);
});

```

```javascript

// we're creating a group of advices which provides memoization
const Memoize = (function() {
  const CACHE_KEY = "#CACHE";
  return {
    read: reflect.advice(meta => {
      if(!meta.scope[CACHE_KEY]) meta.scope[CACHE_KEY] = {};

      if(meta.scope[CACHE_KEY][meta.key]) {
        meta.result = meta.scope[CACHE_KEY][meta.key];
        meta.break();
      }
    }),
    write: reflect.advice(meta => {
      meta.scope[CACHE_KEY][meta.key] = meta.result;
    })
  }
})();

```

### O_O what are advices?

Advices are pieces of code that can be plugged in several places within OOP paradigm like 'beforeMethod', 'afterInstance'.. etc. Advices are used to change, extend, modify the behavior of methods and constructors non-invasively.

If you're looking for better experience using advices and vanilla ES6 classes you should check [kaop-ts](https://github.com/k1r0s/kaop-ts) which is has a nicer look with ES7 Decorators.

### But this library isn't only about `Advices` right?

This library tries to provide an alternative to ES6 class constructors which can be nicer in some way but do not allow reflection (it seems that ES7 Decorators are the way to go but they're still experimental) compared to `createClass` prototyping shell which provides a nice interface to put pieces of code that allows __declarative Inversion of Control__.

### Once you have reflection...

Building Dependency Injection system is trivial. For example:

```javascript
import { createClass, inject, provider, inject } from 'kaop'


// having the following service
const Storage = createClass({
  constructor: function() {
    this.store = {};
  },
  get: function(key){
    return this.store[key];
  },
  set: function(key, val){
    return this.store[key] = val;
  }
});

// you declare a singleton provider (you can use a factory for multiple instances)
const StorageProvider = provider.singleton(Storage);

// and then you inject it in several classes
const Model1 = createClass({
  constructor: [inject.args(StorageProvider), function(_storage) {
    this.storage = _store;
  }]
});

const Model2 = createClass({
  constructor: [inject.args(StorageProvider), function(_storage) {
    this.storage = _store;
  }]
});

const m1 = new Model1;
const m2 = new Model2;

m1.storage instanceof Storage // true
m2.storage instanceof Storage // true

// and they are the same instance coz `StorageProvider` returns a single instance `singleton`
```

### TODO

Way more documentation about Aspect Oriented, Dependency Injection, Composition, Asynchronous Advices, etc.

Tests are the most useful documentation nowadays, that should change soon.

### Similar resources

- [mgechev/aspect.js](https://github.com/mgechev/aspect.js)
- [cujojs/meld](https://github.com/cujojs/meld)
- [kaop-ts](https://github.com/k1r0s/kaop-ts)
