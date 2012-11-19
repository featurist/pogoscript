module.exports (terms) = terms.term {
    constructor () =
        self.is nil = true

    generate java script (buffer, scope) =
        terms.javascript 'void 0'.generate java script (buffer, scope)
}
