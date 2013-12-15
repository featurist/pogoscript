module.exports (terms) = terms.term {
    constructor () =
        self.is break = true

    generate java script statement (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write ('break;')

    rewrite result term into (return term) = self
}
