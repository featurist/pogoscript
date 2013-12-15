module.exports (terms) = terms.term {
    constructor (expr) =
        self.is throw = true
        self.expression = expr

    generate statement (scope) =
        self.code (
            'throw '
            self.expression.generate (scope)
            ';'
        )

    rewrite result term into (return term) = self
}
