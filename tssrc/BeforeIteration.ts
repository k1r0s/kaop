import { IAspectsDescriptorAttributes } from "./IAspectsDescriptorAttributes";
import { Utils } from "./Utils";
import { IAspectDefinition } from "./IAspectDefinition";
import { Aspects } from "./Aspects";

class BeforeIteration {
    iterationProps: IAspectsDescriptorAttributes
    aspectIndex: number = -1
    constructor(props: IAspectsDescriptorAttributes){
        this.iterationProps = props
        this.step()
    }

    step(): void {
        if(this.aspectIndex + 1 >= this.iterationProps.aspects.length){
            this.execOriginalMethod()
            return;
        }
        this.aspectIndex++
        let currentStep = this.iterationProps.aspects[this.aspectIndex]
        let definition: IAspectDefinition = Utils.cookAspectDefinition(currentStep)
        let rawAspectFn = Aspects.getAspect(definition.name)
        let cookedAspect = Utils.transpileAspect(rawAspectFn, this.iterationProps, this.step.bind(this))
        if(definition.args){
            eval("cookedAspect.call(this.iterationProps.scope, " + definition.args + ")");
        } else {
            eval("cookedAspect.call(this.iterationProps.scope)");
        }
    }

    execOriginalMethod(): void {
        this.iterationProps.result = this.iterationProps.method.apply(this.iterationProps.scope, this.iterationProps.args)
    }
}

export { BeforeIteration }
