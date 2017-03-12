var Utils = require("./Utils");

module.exports = Iteration = function(definitionArray, props, pool, locals) {
    if (!definitionArray.length) {
        return;
    }
    this.index = -1;
    this.step = function() {
        this.index++;
        var currentStep = definitionArray[this.index];
        if (typeof currentStep === "function") {
            props.result = currentStep.apply(props.scope, props.args);
            this.step();
        } else if (typeof currentStep === "string") {
            var step = Utils.getAdviceImp(currentStep);
            var rawAdviceFn = Utils.getAdviceFn(step.name, pool);
            var transpiledMethod = Utils.transpileMethod(rawAdviceFn, props, arguments.callee.bind(this), locals);
            if (step.args) {
                eval("transpiledMethod.call(props.scope, " + step.args + ")");
            } else {
                eval("transpiledMethod.call(props.scope)");
            }
        }
    };
    this.step();
};
