module.exports (terms) = terms.term {
    constructor () =
        self.is break = true

    generate java script statement (buffer, scope) =
        buffer.write ('break;')

    generate java script return (args, ...) = this.generate java script statement (args, ...)
}
