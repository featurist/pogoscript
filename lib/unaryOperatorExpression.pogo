codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (operator, expression) =
        self.operator = operator
        self.expr = expression

    expression () =
        name = codegen utils.normalise operator name (self.operator)
        found macro = self.cg.macros.find macro [name]
        
        if (found macro)
            found macro [self.operator] [self.expr]
        else
            self.cg.function call (terms.variable [name], [self.expr])
    
    hash entry () =
        self.cg.errors.add term (self) with message 'cannot be a hash entry'
}
