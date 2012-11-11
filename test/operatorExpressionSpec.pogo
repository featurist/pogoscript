cg = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require './assertions'

expression (expression) =
    cg.operator expression (complex expression (expression))

complex expression (expression) =
    cg.complex expression [expression]

variable (name) =
    cg.variable [name]

loc = {
    first line 1
    last line 1
    first column 3
    last column 8
}

id (name) = cg.loc (cg.identifier (name), loc)

describe 'operator expression'
    it 'a'
        e = expression [id 'a']
        
        (e.expression ()) should contain fields {
            is variable
            variable ['a']
        }
    
    it 'looks up macro'
        e = expression [id 'a']
        e.add operator '+' expression (complex expression [id 'b'])
    
        (e.expression ()) should contain fields {
            operator '+'
            operator arguments [{variable ['a']}, {variable ['b']}]
        }
        
    describe 'hash entry'
        it 'a'
            e = expression [id 'a']
        
            (e.hash entry ()) should contain fields {
                is hash entry
                field ['a']
                value = undefined
            }

        it 'a */ b'
            e = expression [id 'a']
            e.add operator '*/' expression (complex expression [id 'b'])
        
            (e.hash entry ()) should contain fields {
                is semantic failure
            }

    describe 'definition'
        it 'a = b'
            e = expression [id 'a']
            
            (e.definition (variable 'b').expression ()) should contain fields {
                is definition
                target {variable ['a']}
                source {variable ['b']}
            }
                
        it 'a */ b = c'
            e = expression [id 'a']
            e.add operator '*/' expression (complex expression [id 'b'])
            
            (e.definition (variable 'c')) should contain fields {
                is definition
                target {
                    is field reference
                    object {variable ['a']}
                    name ['*/']
                }
                    
                source {
                    is block
                    parameters [{variable ['b']}]
                    optional parameters []
                    body {statements [{variable ['c']}]}
                }
            }
