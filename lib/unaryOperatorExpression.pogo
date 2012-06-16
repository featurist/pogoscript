module.exports (terms) = terms.term {
    constructor (operator, expression) =
        self.operator = operator
        self.expr = expression

    expression () =
        found macro = self.cg.macros.find macro [self.operator]
        
        if (found macro)
            found macro [self.operator] [self.expr]
        else
            self.cg.method call (self.expr) [self.operator] []
    
    hash entry () =
        self.cg.errors.add term (self) with message 'cannot be a hash entry'
}
