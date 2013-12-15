module.exports (terms) = terms.term {
    constructor () =
        self.is nil = true

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (terms.javascript 'void 0'.generate (scope))
}
