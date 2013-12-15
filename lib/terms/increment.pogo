module.exports (terms) = terms.term {
    constructor (expr) =
        self.is increment = true
        self.expression = expr

    generate (scope) =
        self.code ('++', self.expression.generate (scope))
}
