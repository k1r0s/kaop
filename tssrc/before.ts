import { Utils }  from "./Utils";
import { JoinPoint } from "./JoinPoint";

function before (...aspects) {
    return function(proto, key, descriptor){
        descriptor.value = Utils.bootstrap(
            JoinPoint.BEFORE_METHOD,
            {
                method: descriptor.value,
                key,
                proto,
                aspects: aspects
            }
        )

        return descriptor
    }
}

export { before }
