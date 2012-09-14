module.exports (terms) =
    module term = terms.term {
        constructor (statements, global: false, return last statement: false) =
            self.statements = statements
            self.is module = true
            self.global = global

        generate java script module (buffer) =
            scope = new (terms.Symbol Scope (nil))
            definitions = terms.module constants.definitions ()
            self.statements.statements.unshift (definitions, ...)
            self.statements.generate java script statements (buffer, scope, self.global)
    }

    module (statements, in scope: true, global: false, return last statement: false) =
        if (return last statement)
            statements.rewrite last statement to return (async: false)

        statements.global = global

        if (in scope)
            scope = terms.closure ([], statements, return last statement: return last statement, redefines self: true)
            args = [terms.variable (['this'])]

            if (statements.is async)
                error variable = terms.generated variable ['error']
                throw if error = terms.if expression (
                    [[error variable, terms.statements [terms.throw statement (error variable)]]]
                )
                args.push (terms.closure ([error variable], terms.statements [throw if error]))

            method call = terms.method call (terms.sub expression (scope), ['call'], args)
            module term (terms.statements [method call])
        else
            module term (statements, global: global, return last statement: return last statement)
