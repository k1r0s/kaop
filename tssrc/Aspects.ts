import { IAspect } from "./IAspect";

class Aspects {
    static SERVICES: any
    static _store: Array<IAspect> = []
    static add(...aspects): void {
        for (let i = 0; i < aspects.length; i++) {
            this._store.push(aspects[i])
        }
    }
    static getAspect(aspectName: string){
        return this._store.find((aspect) => aspect.name === aspectName);
    }
}

export { Aspects }
