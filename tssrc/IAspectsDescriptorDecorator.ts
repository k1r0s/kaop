interface IAspectsDescriptorDecorator {
    method: (...args: any[]) => any,
    key: string,
    proto: any,
    aspects: any[]
}
