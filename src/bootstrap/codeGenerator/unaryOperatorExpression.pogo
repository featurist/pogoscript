cg = require '../../lib/codeGenerator'
macros = require './macros'
errors = require './errors'

exports.new unary operator expression (operator: nil, expression: nil) =
    cg.term =>
        self.operator = operator
        self.expr = expression

        self.expression () =
            found macro = macros.find macro [self.operator]
            
            if (found macro)
                found macro [self.operator] [self.expr]
            else
                cg.method call (self.expr) [self.operator] []
        
        self.hash entry () =
            errors.add term (self) with message 'cannot be a hash entry'
        
        self.subterms 'expr'
