module.exports (terms) = terms.term {
    constructor (expression, type) =
        self.is instance of = true
        self.expression = expression
        self.type = type
    
    generate (scope) =
        self.code (
            "(typeof("
            self.expression.generate (scope)
            ") === '#(self.type)')"
        )
}
