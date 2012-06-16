module.exports (terms) = terms.term {
    constructor (statements) =
        self.statements = statements
        self.is module = true
        self.in scope = true
        self.global = false
        self.return result = false
  
    generate java script (buffer, scope, global) =
        if (self.in scope)
            b = self.cg.block ([], self.statements, return last statement: false, redefines self: true)
            self.cg.method call (self.cg.sub expression (b), ['call'], [self.cg.variable (['this'])]).generate java script (buffer, new (self.cg.Symbol Scope))
            buffer.write (';')
        else
            if (self.return result)
                self.statements.generate java script statements return (buffer, new (self.cg.Symbol Scope), self.global)
            else
                self.statements.generate java script statements (buffer, new (self.cg.Symbol Scope), self.global)
}
