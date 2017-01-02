var http = require("http");
var assert = require("assert");
var main = require("../index");
var Class = main.Class;
var Decorators = main.Decorators;

var Person;
var Programmer;
var CoolProgrammer;
var DataParser;

var normalPerson;
var normalProgrammer;
var ciroreed;

Decorators.locals.http = http;
Decorators.locals.aux = [];

Decorators.add(function $xhrGet(host) {
    this.before(function(opts, next) {
        http.get({
            host: host
        }, function(res) {
            var body;
            res.on("data", function(d) {
                body = body + d;
            });
            res.on("end", function() {
                opts.args.unshift(body);
                next();
            });
        });
    });
});

Decorators.add(function $log() {
    this.place(function(opts, next) {
        aux.push("logged");
        next();
    });
});


Decorators.add(function $processResponse() {
    this.before(function(opts, next) {
        opts.args[0] = "something";
        next();
    })
});

Decorators.add(function $executeFn(fnName) {
    this.after(function(opts, next) {
        opts.scope[fnName]();
        next();
    })
});

Decorators.add(function $jsonStringify(param) {
    this.before(function(opts, next) {
        opts.args[param] = JSON.stringify(opts.args[param]);
        next();
    });
});

Decorators.add(function $tryReferenceError() {
    this.before(function(opts, next) {
        opts.preventExecution = true;
        opts.result = [];
        try {
            opts.result.push(opts.method.apply(opts.scope, opts.args))
        } catch (e) {
            opts.result.push("error");
        } finally {
            next();
        }
    });

    this.last(function(opts, next) {
        opts.result.push("lastExecution");
        next();
    });
});

Decorators.add(function $appendResult() {
    this.after(function(opts, next) {
        opts.result.push("append...");
        next();
    });
});

describe("functional testing 1", function() {
    before(function() {

        Person = Class({
            constructor: function(name, dborn) {
                this.name = name;
                this.dborn = dborn;
            },
            run: function() {
                return "Im running!";
            },
            getAge: function() {
                var currentYear = new Date()
                    .getFullYear();
                var yearBorn = this.dborn.getFullYear();
                return currentYear - yearBorn;
            }
        });

        normalPerson = new Person("Tom", new Date(1978, 4, 11));
    });

    it("Person instance should have all class methods", function() {
        assert.strictEqual("Tom", normalPerson.name);
        assert.equal(39, normalPerson.getAge());
        assert.equal("Im running!", normalPerson.run());
    });
});

describe("functional testing 2", function() {

    before(function() {
        Programmer = Class.inherits(Person, {
            constructor: ["$override", function(parent, name, dborn, favouriteLanguage) {
                parent(name, dborn);
                this.favLang = favouriteLanguage;
            }],
            run: ["$override", function(parent) {
                return parent() + " but... not as faster, coz im fat :/";
            }],
            code: function() {
                return "Im codding in " + this.favLang;
            }
        });

        CoolProgrammer = Class.inherits(Programmer, {
            constructor: ["$override", function(parent, name, dborn, favouriteLanguage) {
                parent(name, dborn, favouriteLanguage);
            }],
            run: function() {
                return "IM FAST AS HELL!! GET OUT OF MY WAY!";
            }
        });

        normalPerson = new Person("Joe", new Date(1990, 2, 21));
        normalProgrammer = new Programmer("Mike", new Date(1982, 7, 18), "Java");
        ciroreed = new CoolProgrammer("Ciro", new Date(1990, 8, 22), "Javascript");
    });

    it("class instances should be objects with defined properties", function() {
        assert.equal("Joe", normalPerson.name);
        assert.equal("Mike", normalProgrammer.name);
        assert.equal("Ciro", ciroreed.name);

        assert.notEqual("C#", ciroreed.favLang);
    });

    it("inner instances should inherit superClass properties", function() {
        assert.equal(27, normalPerson.getAge());
        assert.notEqual(27, normalProgrammer.getAge());
        assert.equal(27, ciroreed.getAge());

        assert.throws(function() {
            normalPerson.code();
        }, Error);

        assert.notEqual("Im codding in Java", ciroreed.code());
        assert.equal("Im codding in Java", normalProgrammer.code());
    });

    it("instance methods should point to its scope, no mather how they get called", function() {
        var tmpFunction = function(exec) {
            return exec();
        };

        assert.equal(27, tmpFunction(normalPerson.getAge));
        assert.equal(27, tmpFunction(ciroreed.getAge));
        assert.equal(35, tmpFunction(normalProgrammer.getAge));
    });


    it("built in annotation $override should import parent method as first argument", function() {
        assert.equal("Im running!", normalPerson.run());
        assert.equal("Im running! but... not as faster, coz im fat :/", normalProgrammer.run());
        assert.equal("IM FAST AS HELL!! GET OUT OF MY WAY!", ciroreed.run());
    });
});

describe("create a new annotation that parses the first parameter that method receives", function() {

    it("annotation functions can receive parameters to change their behavior", function() {
        DataParser = Class.static({
            serialize: ["$jsonStringify: 0", function(serializedObject) {
                return serializedObject;
            }]
        });

        var o = {
            some: 1,
            data: {
                a: "test"
            },
            asd: [{
                y: 6
            }, {
                y: "asdasd"
            }, {
                y: 5
            }]
        };

        assert.strictEqual('{"some":1,"data":{"a":"test"},"asd":[{"y":6},{"y":"asdasd"},{"y":5}]}', DataParser.serialize(o));
    });
    it("Decorators can run in background", function(done) {
        this.slow(1000);
        DataParser = Class.static({
            ping: ["$xhrGet: 'google.es'", function(response) {
                done();
            }]
        });
        DataParser.ping();
    });

});

describe("extending JS native types", function() {
    var List, listInstance;
    before(function() {
        List = Class.inherits(Array, {
            constructor: ["$override", function(parent) {
                parent();
            }],
            has: function(val) {
                return this.indexOf(val) > -1;
            }
        });
        listInstance = new List();
    });

    it("List should inherit Array properties", function() {
        listInstance.push(3);
        listInstance.push(1);
        listInstance.push(5);
        var result = listInstance.reduce(function(a, b) {
            return a + b;
        });
        assert.strictEqual(result, 9);
    });
    it("List should contain a new method called `has`", function() {
        assert(listInstance.has(3));
        assert(!listInstance.has(454));
    });
});

describe("Decorators could be placed anywhere in the array definition", function() {
    var Service;
    before(function() {
        Service = Class.static({
            operation1: ["$log", function() {
                Decorators.locals.aux.push("operation1");
            }],
            operation2: [function() {
                Decorators.locals.aux.push("operation2");
            }, "$log"]
        });
    });

    it("should check if Decorators are executed given own position", function() {

        Service.operation1();
        Service.operation2();

        assert.strictEqual(Decorators.locals.aux.join(","), "logged,operation1,operation2,logged");
    });
});

describe("Hooks `first` and `last`, flow control", function() {

    var Service;
    before(function() {
        Service = Class.static({
            myMethod: ["$tryReferenceError", function(fnName) {
                function aFunctionWhoDoesNothing() {}
                return eval(fnName + "()");
            }, "$appendResult"]
        })
    });

    it("::myMethod will trigger an exception, should be captured", function() {
        assert.strictEqual(Service.myMethod("kajsdasdasdsadh").join(","), "error,append...,lastExecution");
    });
    it("::myMethod will not trigger any exception", function() {
        assert.strictEqual(Service.myMethod("aFunctionWhoDoesNothing").join(","), ",append...,lastExecution");
    });
});

describe("multiple async operations", function() {
    it("should get google response and then asign to a new variable", function(done) {
        this.slow(1000);
        var MyService = Class.static({
            asyncOperation: ["$xhrGet: 'google.es'", "$processResponse", function(response) {
                if (response === "something") {
                    this.fn = done;
                }
            }, "$executeFn: 'fn'"]
        });

        MyService.asyncOperation();

    });
});
