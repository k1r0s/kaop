import { before } from "../tssrc/before";
import { Aspects } from "../tssrc/Aspects";

Aspects.SERVICES = {
    $$ajax: {
        get: (url, cbk) => {
            console.log(`there was a request to ${url}...`)
            setTimeout(() => {
                console.log(`get response from ${url}!!`)
                cbk();
            }, 500)
        }
    }
}

Aspects.add(
    function log(){
        console.log(`${meta.key} called with ${meta.args}`)
    },
    function lug(name){
        console.log(`it is also posible to have arguments in aspects ${name}, and then interact with the instance ${this[name]}`)
    },
    function lag(){
        SERVICES.$$ajax.get("api.coolwebsite.com", next)
    }
)

class Dummy {
    static url: string = "dummo"

    @before("log", "lug: 'url'", "lag")
    static doSomething(...args){
        console.log("method execution")
        args.pop()()
    }
}

describe("tdd", ()=>{
    it("aspect should be called before method execution", (done)=>{
        Dummy.doSomething("asdasd", 2, 1, done)
    })
})
