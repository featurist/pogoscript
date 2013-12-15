module.exports (terms) = terms.term {
    constructor () =
        self.is nil = true

    generate (scope) =
        self.code (terms.javascript 'void 0'.generate (scope))
}
