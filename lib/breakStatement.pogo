module.exports (terms) = terms.term {
    constructor () =
        self.is break = true

    generate java script statement (buffer, scope) =
        buffer.write ('break;')

    rewrite result term into (return term) = self
}
