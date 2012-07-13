module.exports (terms) = terms.term {
    constructor (statements) =
        self.statements = statements
        self.is module = true
        self.in scope = true
        self.global = false
        self.return last statement = false

    generate java script module (buffer) =
        self.statements.generate java script statements (buffer, new (terms.Symbol Scope), self.global)

    expand macro (clone) =
        if (self.in scope)
            b = terms.closure ([], self.statements, return last statement: false, redefines self: true)
            method call = clone (terms.method call (terms.sub expression (b), ['call'], [terms.variable (['this'])]))
            terms.module (terms.statements [method call])
        else
            statements = clone ().statements.rewrite async callbacks (return last statement: self.return last statement)
            statements.global = self.global
            statements
            terms.module (statements)
}
