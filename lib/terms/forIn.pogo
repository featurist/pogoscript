module.exports (terms) = terms.term {
    constructor (iterator, collection, stmts) =
        self.is for in = true
        self.iterator = terms.definition (iterator, terms.nil ())
        self.collection = collection
        self.statements =
            terms.sub expression (
                terms.function call (
                    terms.block (
                        [iterator]
                        stmts
                        return last statement: false
                    )
                    [iterator]
                )
            )
  
    generate (scope) =
        self.code (
            'for('
            self.iterator.target.generate (scope)
            ' in '
            self.collection.generate (scope)
            '){'
            self.statements.generate statement (scope)
            '}'
        )

    generate statement (args, ...) = self.generate (args, ...)

    rewrite result term into (return term) = nil
}
