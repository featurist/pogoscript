codegen utils = require '../terms/codegenUtils'

module.exports (terms) = terms.term {
    constructor (operator, expression) =
        self.operator = operator
        self.expr = expression

    expression () =
        name = codegen utils.normalise operator name (self.operator)
        found macro = terms.macros.find macro [name]
        
        if (found macro)
            found macro (self, [self.operator], [self.expr])
        else
            terms.function call (terms.variable [name], [self.expr])
    
    hash entry () =
        terms.errors.add term (self) with message 'cannot be a hash entry'
}
