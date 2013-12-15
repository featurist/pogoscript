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
        self.code into buffer (buffer) @(buffer)
            buffer.write ('for(')
            buffer.write (self.iterator.target.generate (scope))
            buffer.write (' in ')
            buffer.write (self.collection.generate (scope))
            buffer.write ('){')

            buffer.write (self.statements.generate statement (scope))

            buffer.write ('}')

    generate statement (args, ...) = self.generate (args, ...)

    rewrite result term into (return term) = nil
}
