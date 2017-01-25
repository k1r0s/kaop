/**
 * this is a brew example of what kind of syntax we're looking for
 *
 * playground!!
 * playground!!
 *
 * substring
 *
 * indexOf("{") + 1
 *
 * lastIndexOf("}"))
 *
 * (function(){  }).toString().indexOf("next()") `deprecated`
 * (function(){  }).toString().match(/[^a-zA-Z_$]next[^a-zA-Z_$]/)
 * detect if next namespace is used
 *
 */


/**
 * myLog - simple decorator
 */
Decorators.add(function myLog() {
    console.log("the method " + meta.name + " was executed successful");
});

Decorators.add(function myAsyncTask(time) {
    setTimeout(function() {
        console.log("the execution of " + meta.name + " was delayed " + time + " milisecs");
        next();
    }, time);
});

/**
 * VS
 */


/**
 * myLog - actual decorator
 */
Decorators.add(function myLog() {
    this.place(function(opts, next) {
        console.log("the method " + opts.methodName + " was executed successful");
        next();
    });
});

Decorators.add(function myAsyncTask(time) {
    this.place(function(opts, next) {
        setTimeout(function() {
            console.log("the execution of " + opts.methodName + " was delayed " + time + " milisecs");
            next();
        }, time);
    });
});
