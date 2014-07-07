async control = require '../asyncControl'

module.exports (terms) =
    for expression term = terms.term {
        constructor (init, test, incr, stmts) =
            self.is for = true
            self.initialization = init
            self.test = test
            self.increment = incr
            self.index variable = init.target
            self.statements = stmts
            self.statements = self._scoped body ()

        _scoped body () =
            contains return = false
            for result variable = self.cg.generated variable ['for', 'result']
            rewritten statements = self.statements.rewrite (
                rewrite (term):
                    if (term.is return)
                        contains return := true
                        terms.sub statements [
                            self.cg.definition (for result variable, term.expression, assignment: true)
                            self.cg.return statement (self.cg.boolean (true))
                        ]

                limit (term, path: path):
                    term.is closure
            ).serialise all statements ()

            if (contains return)
                loop statements = []
                loop statements.push (self.cg.definition (for result variable, self.cg.nil ()))
                loop statements.push (
                    self.cg.if expression (
                        [{
                            condition = self.cg.sub expression (
                                self.cg.function call (self.cg.block ([self.index variable], rewritten statements, return last statement: false), [self.index variable])
                            )
                            body = self.cg.statements ([self.cg.return statement (for result variable)])
                        }]
                    )
                )

                self.cg.async statements (loop statements)
            else
                self.statements
      
        generate (scope) =
            self.code (
                'for('
                self.initialization.generate (scope)
                ';'
                self.test.generate (scope)
                ';'
                self.increment.generate (scope)
                '){'
                self.statements.generate statements (scope)
                '}'
            )

        generate statement (args, ...) = self.generate (args, ...)

        rewrite result term into (return term) = nil
    }

    for expression (init, test, incr, body) =
        initStatements = terms.asyncStatements [init]
        testStatements = terms.asyncStatements [test]
        incrStatements = terms.asyncStatements [incr]

        if ((initStatements.returnsPromise || testStatements.returnsPromise) || (incrStatements.returnsPromise || body.returnsPromise))
            async for function =
                terms.module constants.define ['async', 'for'] as (
                    terms.javascript (async control.for.to string ())
                )

            terms.scope [
                init
                terms.resolve(
                  terms.function call (
                      async for function
                      [
                          terms.closure ([], testStatements)
                          terms.closure ([], incrStatements)
                          terms.closure ([], body)
                      ]
                  ).alreadyPromise()
                )
            ]
        else
            for expression term (init, test, incr, body)
