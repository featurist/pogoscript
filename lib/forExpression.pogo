module.exports (terms) = terms.term {
    constructor (init, test, incr, stmts) =
        self.is for = true
        self.initialization = init
        self.test = test
        self.increment = incr
        self.index variable = init.target
        self.statements = stmts

    _scoped body () =
        contains return = false
        for result variable = self.cg.generated variable ['for', 'result']
        rewritten statements = self.statements.clone (
            rewrite (term):
                if (term.is return)
                    contains return = true
                    terms.sub statements [self.cg.definition (for result variable, term.expression), self.cg.return statement (self.cg.boolean (true))]

            limit (term, path: path):
                term.is closure
        ).clone (
            rewrite (term):
                if (term.is statements)
                    term.serialise sub statements

            limit (term):
                term.is closure
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

            self.cg.async statements (loop statements)
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
        self.statements.generate java script statements (buffer, scope)
        buffer.write ('}')

    generate java script statement (args, ...) = self.generate java script (args, ...)

    declare variables (variables, scope) =
        self.index variable.declare variable (variables, scope)

    rewrite result term into (return term) = self
}
