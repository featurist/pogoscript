module.exports (terms) = terms.term {
    constructor (init, test, incr, stmts) =
        self.is for = true
        self.initialization = init
        self.test = test
        self.increment = incr
        self.statements = stmts
      
        self.index variable = init.target

    scoped body () =
        contains return = false
        for result variable = self.cg.generated variable ['for', 'result']
        statements = self.statements.clone (
            rewrite (term):
                if (term.is return)
                    contains return = true
                    self.cg.statements ([self.cg.definition (for result variable, term.expression), self.cg.return statement (self.cg.boolean (true))], expression: true)

            limit (term, path: path):
                if (term.is statements)
                    if (path.length > 0)
                        path.(path.length - 1).is closure
        )

        if (contains return)
            loop statements = []
            loop statements.push (self.cg.definition (for result variable, self.cg.nil ()))
            loop statements.push (
                self.cg.if expression (
                    [[
                        self.cg.sub expression (
                            self.cg.function call (self.cg.block ([self.index variable], statements, return last statement: false), [self.index variable])
                        )
                        self.cg.statements ([self.cg.return statement (for result variable)])
                    ]]
                )
            )

            self.cg.statements (loop statements)
        else
            self.statements
  
    generate java script (buffer, scope) =
        buffer.write ('for(')
        self.initialization.generate java script (buffer, scope)
        buffer.write (';')
        self.test.generate java script (buffer, scope)
        buffer.write (';')
        self.increment.generate java script (buffer, scope)
        buffer.write ('){')
        self.scoped body ().generate java script statements (buffer, scope)
        buffer.write ('}')

    generate java script statement (args, ...) = self.generate java script (args, ...)
    generate java script return (args, ...) = self.generate java script (args, ...)
  
    definitions (scope) =
        defs = []
        index name = self.index variable.definition name (scope)
        if (index name)
            defs.push (index name)

        defs
}
