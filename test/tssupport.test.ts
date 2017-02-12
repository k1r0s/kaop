import { utils } from "../tssrc/utils";

describe("tdd1", () => {

    it("should retrieve aspects attached to a method", () => {

        expect(utils.cookAspectDefinition("myAspect")).toEqual({ args: undefined, name: "myAspect"})
        expect(utils.cookAspectDefinition("myAspect# 14, 'asd'")).toEqual({ args: " 14, 'asd'", name: "myAspect"})

    })

})
