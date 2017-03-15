var Advices = require("./Advices");

module.exports = UseExternal = function(module){
    function checkDependency(dep){
        if(!Advices.locals[dep]) throw new Error("unmet dependency: " + dep);
    }

    module.dependencies.forEach(checkDependency);

    module.advices.forEach(Advices.add, Advices);
};
