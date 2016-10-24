### kaop

this library is a light package to provide OOP utils which provides several features such save code, enhance readability, and also provide an alternative to use the lowest JS version with OOP features:

**Extend**

```javascript
var Class = require("kaop").Class
```

-`Class(properties)` is a function which returns a fn constructor that implements defined properties.

-`Class.inherits(SuperClass, SubClass properties)` extend the SuperClass properties replacing if they have the same key/name.. we can override methods with the built in annotation `$override` (recursively through upper classes (for sure!)).

-`Class.static(properties)` returns a plain object with the given properties like plain JavaScript does, we may use this only to use annotations.

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
  // annotation override inject the SuperClass.constructor as the first parameter
  constructor: ["$override", function(parent, name, dborn, favouriteLanguage){
    parent(name, dborn) //calling it we can save a lot of code
    this.favLang = favouriteLanguage
  }],
  run: ["$override", function(parent){ //we simply override it to change the behavior
    return parent() + " but... not as faster, coz im fat :/"
  }],
  code: function(){ //new method for Programmer instances
    return "Im codding in " + this.favLang
  }
})
```
As you may wonder Programmer `constructor` overrides super (or parent) constructor following the OOP criteria. So each time we create an instance of Programmer we're calling parent constructor.

> Note that if you declare a constructor in subClass you must override the parent constructor. If u dont override it, may we receive an unespected behavior (if you dont override it u're just replacing the parent constructor, so it may work, but ... probably is not what you want :|).

Note that we're using `$override` annotation to get superClass method in the subClass method, if we remove the $override from the method we're just replacing the method, so be aware of this!.

**Annotations**

```javascript
var annotations = require("kaop").annotations
```
`annotations.add(function $annotationName(){  ....  })` provides a way to add new features to your app, annotations can modify class methods.

Having this one:
```javascript
annotations.add(function $jsonStringify(param){
  this.before(function(opts, next){
    opts.args[param] = JSON.stringify(opts.args[param])
    next()
    //or this.next()
  })
})
```
And then:
```javascript
CoolProgrammer = extend(Programmer, {
  constructor: ["$override", function(parent, name, dborn, favouriteLanguage){ //method recursive override
    parent(name, dborn, favouriteLanguage)
  }],
  run: function(){ //parent method replacement
    return "IM FAST AS HELL!! GET OUT OF MY WAY!"
  },
  serialize: ["$jsonStringify: 0", function(serializedObject){
    // do stuff
    // jsonStringify annotation injects the 0 param as string
    return serializedObject
  }]
})
```
Note that in the previous sample there is a `serialize` method that has `$jsonStringify` annotation...

So the following code does this:

```javascript
var i = new CoolProgrammer("Ciro", new Date(1990, 8, 22), "Javascript")
i.serialize({some: 1, data: {a: "test"}, asd: [{y: 6},{y: "asdasd"},{y: 5}]}) //outputs '{"some":1,"data":{"a":"test"},"asd":[{"y":6},{"y":"asdasd"},{"y":5}]}' in string..
```

### YOLO

As you may wonder annotations support **chained** asynchronous calls because they are callback driven.

Multiple annotations for the same method are allowed. You might use hooks inside annotation declaration to control when the annotation will be executed, you can also define multiple hooks in the same annotation:

> NOTE! to use custom objects/services (user defined variables) inside annotations you must define it as properties of annotations::locals. IE: var myCoolService = {cool: 'stuff'}; and then you try to use that inside an annotation it will give an reference error unless you do annotations.locals.myCoolService = myCoolService.  

```javascript
annotations.add(function $save(index){
  // hooks
  // this.before(function(opts, next){
  // this.after(function(opts, next){
  this.after(function(opts, next){
    //this method will be executed AFTER the annotated method return it result, so we can
    //perform several actions with it (with the result or what ever is defined in the
    //method)

    // stuff...

    opts.args //contains the arguments or parameters that the method receives
    opts.result //contains the returned value
    opts.scope //it used to be `this` inside the method, so its the instance itself
    opts.parentScope //gives you access to the parent prototype or.. how `$override` works
    opts.method //it will be executed after all the befores hooks have been consumed
    opts.methodName //the method name string, for tracking purposes.. or any

    // next() //when called, next hook will trigger..
    // stuff...

    // asynchronous example
    myService.get("myEndPoint").success(function(){
      // stuff...
      next() //so the next execution wait until next is called
    })
  })
})
```

#TODO
- document the framework
...
