module.exports (terms) = terms.term {
    constructor (stmts, always generate function: false) =
        self.is scope = true
        self.statements = stmts
        self.always generate function = always generate function
    
    generate java script (buffer, scope) =
        if ((self.statements.length == 1) && !self.always generate function)
            self.statements.0.generate java script (buffer, scope)
        else
            self.cg.function call (self.cg.sub expression (self.cg.block ([], self.cg.statements (self.statements))), []).generate java script (buffer, scope)
}
