cg = require '../../lib/codeGenerator'
macros = require './macros'

exports: new unary operator expression, operator, expression =
    cg: term =>
        :operator = operator
        :expr = expression

        :expression? =
            found macro = macros: find macro [:operator]
            
            if (found macro)
                found macro [:operator] [:expr]
            else
                cg: method call (:expr) [:operator] []
        
        :subterms 'operator' 'expr'