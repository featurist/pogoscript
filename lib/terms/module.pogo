module.exports (terms) =
    module term = terms.term {
        constructor (statements, global: false, return last statement: false, body statements: nil) =
            self.statements = statements
            self.is module = true
            self.global = global
            self.body statements = (body statements || statements)

        generate java script module (buffer) =
            scope = new (terms.Symbol Scope (nil))
            self.statements.generate java script statements (buffer, scope, global: self.global, in closure: true)
    }

    module (statements, in scope: true, global: false, return last statement: false, body statements: body statements) =
        if (return last statement)
            statements.rewrite last statement to return (async: false)

        if (in scope)
            scope = terms.closure ([], statements, return last statement: return last statement, redefines self: true, defines module constants: true)
            args = [terms.variable (['this'])]

            if (statements.is async)
                error variable = terms.generated variable ['error']
                throw if error = terms.if expression (
                    [{
                        condition = error variable
                        body = terms.statements [
                            terms.function call (
                                terms.variable ['set', 'timeout']
                                [
                                    terms.closure (
                                        []
                                        terms.statements [
                                            terms.throw statement (error variable)
                                        ]
                                    )
                                    terms.integer 0
                                ]
                            )
                        ]
                    }]
                )
                args.push (terms.closure ([error variable], terms.statements [throw if error]))

            method call = terms.method call (terms.sub expression (scope), ['call'], args)
            module term (terms.statements [method call], body statements: statements, global: global)
        else
            module term (statements, global: global, return last statement: return last statement, body statements: body statements)
