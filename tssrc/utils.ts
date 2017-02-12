import { IAspectDefinition } from "./IAspectDefinition";
import { IAspectsDescriptorAttributes } from "./IAspectsDescriptorAttributes";
import { JoinPoint } from "./JoinPoint";
import { BeforeIteration } from "./BeforeIteration";
import { ICookedAspect } from "./ICookedAspect";
import { Aspects } from "./Aspects";

class utils {
    static cookAspectDefinition(aspectDefinition: string): IAspectDefinition {
        let definition: Array<string> = aspectDefinition.split("#")
        return {
            name: definition[0],
            args: definition[1]
        }
    }
    static transpileAspect(rawAspect, meta: IAspectsDescriptorAttributes, next: () => void): ICookedAspect {
        //in order to make this more readable
        //TODO: http://stackoverflow.com/questions/38338013/can-you-extend-a-function-in-typescript
        let methodToString = rawAspect.toString();
        let functionBody = methodToString
            .substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"));
        let functionArguments = methodToString
            .substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"));

        if (!functionBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            functionBody += "\nnext();";
        }

        let transpiledFunction = "(function(" + functionArguments + ")\n{ " + functionBody + " \n})";
        var SERVICES = Aspects.SERVICES
        return eval(transpiledFunction)
    }
    static bootstrap(jp: JoinPoint, config: IAspectsDescriptorDecorator): (...args) => any {
        return function(...args){

            let props: IAspectsDescriptorAttributes

            props = {
                method: config.method,
                key: config.key,
                proto: config.proto,
                aspects: config.aspects,
                scope: this,
                args,
                result: null
            }

            new BeforeIteration(props)
        }
    }
}

export { utils }
