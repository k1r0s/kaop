import { Utils } from "../tssrc/Utils";

describe("tdd1", () => {

    it("should retrieve aspects attached to a method", () => {

        expect(Utils.cookAspectDefinition("myAspect")).toEqual({ args: undefined, name: "myAspect"})
        expect(Utils.cookAspectDefinition("myAspect: 14, 'asd'")).toEqual({ args: " 14, 'asd'", name: "myAspect"})

    })

})
