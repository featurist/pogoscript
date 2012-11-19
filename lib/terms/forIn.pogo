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
  
    generate java script (buffer, scope) =
        buffer.write ('for(')
        self.iterator.target.generate java script (buffer, scope)
        buffer.write (' in ')
        self.collection.generate java script (buffer, scope)
        buffer.write ('){')

        self.statements.generate java script statement (buffer, scope)

        buffer.write ('}')

    generate java script statement (args, ...) = self.generate java script (args, ...)

    rewrite result term into (return term) = nil
}
