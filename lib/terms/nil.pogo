module.exports (terms) = terms.term {
    constructor () =
        self.is nil = true

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            terms.javascript 'void 0'.generate java script (buffer, scope)
}
