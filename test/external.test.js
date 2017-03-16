var main = require("../lib/index");
var assert = require("assert");

main.Advices.locals["$$dep1"] = { sayHello: function(){} };

// var testmodule = require("myAopModule")
var testmodule = {
    dependencies: ["$$dep1"],
    advices: [
        function something(){
            $$dep1.sayHello();
        }
    ]
};

describe("allow third part advices", function(){

    it("should throw an error if there are unmet dependencies", function(){

        delete main.Advices.locals.$$dep1;

        assert.throws(function(){
            main.use(testmodule);
        }, Error);
    });

    it("should load third part module", function(done){
        main.Advices.locals["$$dep1"] = { sayHello: done };

        main.use(testmodule);

        var SomeService = main.Class.static({
            myMethod: [function(){
                //method execution
            }, "something"]
        });

        SomeService.myMethod();
    });
});
