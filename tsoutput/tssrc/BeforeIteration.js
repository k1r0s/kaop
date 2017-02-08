"use strict";
var Utils_1 = require("./Utils");
var Aspects_1 = require("./Aspects");
var BeforeIteration = (function () {
    function BeforeIteration(props) {
        this.aspectIndex = -1;
        this.iterationProps = props;
        this.step();
    }
    BeforeIteration.prototype.step = function () {
        if (this.aspectIndex + 1 >= this.iterationProps.aspects.length) {
            this.execOriginalMethod();
            return;
        }
        this.aspectIndex++;
        var currentStep = this.iterationProps.aspects[this.aspectIndex];
        var definition = Utils_1.Utils.cookAspectDefinition(currentStep);
        var rawAspectFn = Aspects_1.Aspects.getAspect(definition.name);
        var cookedAspect = Utils_1.Utils.transpileAspect(rawAspectFn, this.iterationProps, this.step.bind(this));
        if (definition.args) {
            eval("cookedAspect.call(this.iterationProps.scope, " + definition.args + ")");
        }
        else {
            eval("cookedAspect.call(this.iterationProps.scope)");
        }
    };
    BeforeIteration.prototype.execOriginalMethod = function () {
        this.iterationProps.result = this.iterationProps.method.apply(this.iterationProps.scope, this.iterationProps.args);
    };
    return BeforeIteration;
}());
exports.BeforeIteration = BeforeIteration;
