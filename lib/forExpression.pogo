module.exports (terms) = terms.term {
    constructor (init, test, incr, stmts) =
        self.is for = true
        self.initialization = init
        self.test = test
        self.increment = incr
        self.index variable = init.target
        self.statements = self.scoped body (stmts)

    scoped body (statements) =
        contains return = false
        for result variable = self.cg.generated variable ['for', 'result']
        rewritten statements = statements.clone (
            rewrite (term):
                if (term.is return && !term.is implicit)
                    contains return = true
                    terms.sub statements [self.cg.definition (for result variable, term.expression), self.cg.return statement (self.cg.boolean (true))]

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
                            self.cg.function call (self.cg.block ([self.index variable], rewritten statements, return last statement: false), [self.index variable])
                        )
                        self.cg.statements ([self.cg.return statement (for result variable)])
                    ]]
                )
            )

            self.cg.statements (loop statements)
        else
            statements
  
    generate java script (buffer, scope) =
        buffer.write ('for(')
        self.initialization.generate java script (buffer, scope)
        buffer.write (';')
        self.test.generate java script (buffer, scope)
        buffer.write (';')
        self.increment.generate java script (buffer, scope)
        buffer.write ('){')
        self.statements.generate java script statements (buffer, scope)
        buffer.write ('}')

    generate java script statement (args, ...) = self.generate java script (args, ...)
    generate java script return (args, ...) = self.generate java script (args, ...)

    declare variables (variables, scope) =
        self.index variable.declare variable (variables, scope)
}
