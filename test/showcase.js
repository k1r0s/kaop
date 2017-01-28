/**
 * This test is a showcase of some capabilities
 *
 * In this sample we have a data model which send request to
 * some API rest service and then emit notifications to whose
 * that are listenning.
 */

var assert = require("assert");
var main = require("../index");
var Class = main.Class;
var Decorators = main.Decorators;



Decorators.locals.myCoolService = $$myCoolService = 1;

/**
 * decorator - function sendResult
 * this decorator send an API request
 * related with the targeted class instance
 */

Decorators.add(function save() {
    this.after(function(opts, next) {
        if (!opts.result) {
            next();
            return;
        }

        // ... myCoolService becomes available, here we
        // place our code to perform a request to the server
        // ofc we skip this here. kaop annotations are callback
        // driven, so we execute `next` function when action is
        // complete. `next` will trigger the queue actions...
        var METHOD = opts.scope.id ? "PUT" : "POST";
        var EXAMPLE_REQUEST = "somehost:8080/api" + opts.scope.url();
        var REQUEST_PAYLOAD = opts.result;

        console.log(METHOD, EXAMPLE_REQUEST, REQUEST_PAYLOAD);

        setTimeout(next, 500);
    });
});


/**
 * decorator - function serialize
 * this decorator serializes the targeted instance
 */

Decorators.add(function serialize() {
    this.after(function(opts, next) {
        if (!opts.result) {
            next();
            return;
        }
        // opts.result is the returned value at the
        // current point of flow
        //
        // opts.scope is the current instance of decorated class
        opts.result = JSON.stringify(opts.scope.attributes);
        next();
    });
});


/**
 * defer - description
 * defer the execution of a method of the targeted instance
 * at the right timming
 * param  {string} nameContext method to be executed
 */

Decorators.add(function defer(nameContext) {
    this.place(function(opts, next) {
        eval("opts.scope." + nameContext + "(opts.methodName)");
        next();
    });
});

/**
 * class ExampleModel
 */
var ExampleModel = Class({

    /**
     * property actionsPool
     * contains an array with the attached operations
     */
    actionsPool: null,

    /**
     * property attributes
     * contains the properties pair value
     */
    attributes: null,
    /**
     * function constructor
     *
     */
    constructor: function() {
        this.attributes = {};
        this.actionsPool = [];
    },

    /**
     * function url
     * returns the path where request are made to interact
     * with this resource
     *
     * return {string} api url
     */
    url: function() {
        return "/ExampleModel/" + (this.id || "");
    },

    /**
     * function on - description
     * attaches a function handler to be executed when
     * another method is executed
     * param {string} action the method name we're waiting for
     * param {function} handler the function to be executed
     */
    on: function(action, handler) {
        this.actionsPool.push({
            id: action,
            fn: handler
        });
    },


    /**
     * fire - description
     * this method triggers the associated callbacks
     * param  {type} actionName key which determine callbacks
     */
    fire: function(actionName) {
        this.actionsPool.forEach(function(action) {
            if (action.id === actionName) {
                action.fn();
            }
        })
    },

    /**
     * function set - description
     * sets a value associated with a key property
     * param {string} key the unique id of that property
     * param {any} value
     *
     * decorators serialize, save, triggerChange
     */
    set: [function(key, value) {
        if (this.attributes[key] !== value) {
            this.attributes[key] = value;
            return true;
        }
    }, "serialize", "save", "defer: 'fire'"],

    /**
     * function get - description
     * retrieves the attribute value of the given key
     * param {string} key , the name of the attribute
     * return {any} value of the property
     */
    get: function(key) {
        return this.attributes[key];
    }
});


// Test definition
describe("KAOP SHOWCASE", function() {
    var exampleModelInstance;

    before(function() {
        exampleModelInstance = new ExampleModel;
    });

    it("should perform a request when attribute change", function(done) {

        this.slow(1000);

        exampleModelInstance.on("set", done);

        exampleModelInstance.set("name", "Iván");

    });
})
