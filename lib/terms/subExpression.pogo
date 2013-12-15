module.exports (terms) = terms.term {
    constructor (expression) =
        self.is sub expression = true
        self.expression = expression

    generate (scope) =
        self.code (
            '('
            self.expression.generate (scope)
            ')'
        )
}
