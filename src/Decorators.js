var Decorators = {
    arr: [
        function override() {
            this.before(function(opts, next) {
                opts.args.unshift(opts.parentScope[opts.methodName].bind(opts.scope));
                next();
            });
        }
    ],
    locals: {},
    add: function(ann) {
        this.arr.push(ann);
    },
    names: function() {
        return this.arr.map(function(fn) {
            return fn.name;
        });
    },
    getAnnotation: function(annotationName) {
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i].name === annotationName.replace("@", "")) {
                return this.arr[i];
            }
        }
    },
    Store: function(opts) {
        this.isBefore = true;
        this.last = null;
        var befores = [];
        var afters = [];
        this.first = function(fn) {
            this.prepareFirst = function() {
                befores.unshift(fn);
            };
        };
        this.last = function(fn) {
            this.prepareLast = function() {
                afters.push(fn);
            };
        };
        this.before = function(fn) {
            befores.push(fn);
        };
        this.place = function(fn) {
            if (this.isBefore) {
                befores.push(fn);
            } else {
                afters.push(fn);
            }
        };
        this.after = function(fn) {
            afters.push(fn);
        };
        this.next = function() {
            var nextBeforeFn = befores.shift();
            if (nextBeforeFn) {
                nextBeforeFn.call(this, opts, arguments.callee);
                return;
            }
            if (!opts.preventExecution) {
                opts.result = opts.method.apply(opts.scope, opts.args);
                opts.preventExecution = true;
            }
            var nextAfterFn = afters.shift();
            if (nextAfterFn) {
                nextAfterFn.call(this, opts, arguments.callee);
            }
        };
    },
    fireMethodDecorators: function(Decorators, storeInstance, locals) {

        for (var i = 0; i < Decorators.length; i++) {
            if (typeof Decorators[i] === "function") {
                storeInstance.isBefore = false;
                continue;
            }
            var preparedAnnotation = Decorators[i].split(":");
            var annotationFn = this.getAnnotation(preparedAnnotation[0]);
            var annotationArguments = preparedAnnotation[1];

            with(locals) {
                if (annotationArguments) {
                    eval("(" + annotationFn + ".call(storeInstance, " + annotationArguments + "))");
                } else {
                    eval("(" + annotationFn + ".call(storeInstance))");
                }
            }
        }
        if (typeof storeInstance.prepareFirst === "function") {
            storeInstance.prepareFirst();
        }
        if (typeof storeInstance.prepareLast === "function") {
            storeInstance.prepareLast();
        }
    },
    getMethodDecorators: function(array) {
        return array.filter(function(item) {
            return typeof item !== "function";
        });
    },
    getAnnotatedMethod: function(array) {
        return array.find(function(item) {
            return typeof item === "function";
        });
    },
    isValidStructure: function(array) {
        return array instanceof Array && array.some(function(item) {
            return typeof item === "function";
        });
    },
    isValidAnnotationArray: function(array) {
        return this.getMethodDecorators(array)
            .map(function(item) {
                return item.split(":")
                    .shift();
            })
            .every(this.getAnnotation, this);
    },
    compile: function(superClass, propertyName, propertyValue) {
        if (!(
                propertyValue &&
                this.isValidStructure(propertyValue) &&
                this.isValidAnnotationArray(propertyValue)
            )) {
            return propertyValue;
        }

        var selfDecorators = this;

        return function() {

            var opts = {
                scope: this,
                parentScope: superClass.prototype,
                method: selfDecorators.getAnnotatedMethod(propertyValue),
                methodName: propertyName,
                args: Array.prototype.slice.call(arguments),
                result: undefined
            };

            var store = new selfDecorators.Store(opts);

            selfDecorators.fireMethodDecorators(propertyValue, store, selfDecorators.locals);

            store.next();

            return opts.result;
        };
    }
};

module.exports = Decorators;
