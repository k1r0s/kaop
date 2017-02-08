interface IAspectType extends Function {
    getBody(): string
    getArguments(): string
}

function AspectTypeBuilder (rawAspect: IAspectType): IAspectType {
    rawAspect.getBody = function(): string {
        let methodToString = this.toString()
        return methodToString.substring(methodToString.indexOf("{") + 1, methodToString.lastIndexOf("}"))
    }
    rawAspect.getArguments = function(): string {
        let methodToString = this.toString()
        return methodToString.substring(methodToString.indexOf("(") + 1, methodToString.indexOf(")"))
    }
    return rawAspect
}

export { AspectTypeBuilder, IAspectType }
