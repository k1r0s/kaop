"use strict";
var BeforeIteration = (function () {
    function BeforeIteration(props) {
        this.aspectIndex = 0;
        this.iterationProps = props;
        this.step();
    }
    BeforeIteration.prototype.step = function () {
    };
    BeforeIteration.prototype.execOriginalMethod = function () {
        this.iterationProps.result = this.iterationProps.method.apply(this.iterationProps.scope, this.iterationProps.args);
    };
    return BeforeIteration;
}());
exports.BeforeIteration = BeforeIteration;
