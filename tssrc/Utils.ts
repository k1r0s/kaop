import { IAspectDefinition } from "./IAspectDefinition";
import { IAspectsDescriptorAttributes } from "./IAspectsDescriptorAttributes";
import { JoinPoint } from "./JoinPoint";
import { BeforeIteration } from "./BeforeIteration";
import { Aspects } from "./Aspects";
import { AspectTypeBuilder } from "./IAspectType";

class Utils {
    static cookAspectDefinition(aspectDefinition: string): IAspectDefinition {
        let aspectDefinitionPartials = aspectDefinition.split(":")
        return {
            name: aspectDefinitionPartials[0],
            args: aspectDefinitionPartials[1]
        }
    }
    static transpileAspect(rawAspect, meta: IAspectsDescriptorAttributes, next: () => void) {
        let aspectType = AspectTypeBuilder(rawAspect)
        let aspectBody = aspectType.getBody()
        //we need to look if 'next' callback was defined
        if (!aspectBody.match(/[^a-zA-Z_$]next[^a-zA-Z_$0-9]/g)) {
            //if so we assume that there is no async code in there
            aspectBody += "\nnext();"
        }
        let transpiledFunction = `(function(${aspectType.getArguments()})\n{${aspectBody}\n})`
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

export { Utils }
