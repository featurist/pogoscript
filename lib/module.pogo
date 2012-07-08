module.exports (terms) = terms.term {
    constructor (statements) =
        self.statements = statements
        self.is module = true
        self.in scope = true
        self.global = false
        self.return result = false

    generate java script (buffer, scope, global) =
        if (self.return result)
            self.statements.generate java script statements return (buffer, new (terms.Symbol Scope), self.global)
        else
            self.statements.generate java script statements (buffer, new (terms.Symbol Scope), self.global)

    expand macro () =
        if (self.in scope)
            b = terms.closure ([], self.statements, return last statement: false, redefines self: true)
            call = terms.method call (terms.sub expression (b), ['call'], [terms.variable (['this'])])
            terms.module (terms.statements [call].expand macros ())
}
