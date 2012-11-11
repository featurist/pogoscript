cg = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require './assertions'

describe 'unary operator expression'
    it 'as expression'
        op expr = cg.unary operator expression ('@cat', {variable ['a']})

        (op expr.expression ()) should contain fields {
            is function call
            function {variable ['cat']}
            function arguments [{variable ['a']}]
        }
    
    it 'as expression with macro'
        op expr = cg.unary operator expression ('!', {variable ['a']})
        
        (op expr.expression ()) should contain fields {
            is operator
            operator '!'
            operator arguments [{variable ['a']}]
        }

    it 'as hash entry will be semantic failure'
        op expr = cg.unary operator expression ('%', {variable ['a']})
        
        (op expr.hash entry ()) should contain fields {
          is semantic failure
        }
