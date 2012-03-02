require 'cupoftea'
cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'

expression @expression =
    cg: operator expression (complex expression @expression)

complex expression @expression =
    cg: complex expression [expression]

variable @name =
    cg: variable [name]

loc = {
    first line 1
    last line 1
    first column 3
    last column 8
}

id @name = cg: loc (cg: identifier @name) @loc

spec 'operator expression'
    spec 'a'
        e = expression [id 'a']
        
        (e: expression?) should contain fields {
            is variable
            variable ['a']
        }

    spec 'a +- b'
        e = expression [id 'a']
        e: add operator '+-' expression (complex expression [id 'b'])
        
        (e: expression?) should contain fields {
            is method call
            object {variable ['a']}
            name ['+-']
            arguments [{variable ['b']}]
        }

    spec 'a +- b */ c'
        e = expression [id 'a']
        e: add operator '+-' expression (complex expression [id 'b'])
        e: add operator '*/' expression (complex expression [id 'c'])
        
        (e: expression?) should contain fields {
            is method call
            object {variable ['a']}
            name ['+-'. '*/']
            arguments [{variable ['b']}. {variable ['c']}]
        }
    
    spec 'looks up macro'
        e = expression [id 'a']
        e: add operator '+' expression (complex expression [id 'b'])
    
        (e: expression?) should contain fields {
            operator '+'
            arguments [{variable ['a']}. {variable ['b']}]
        }
        
    spec 'hash entry'
        spec 'a'
            e = expression [id 'a']
        
            (e: hash entry?) should contain fields {
                is hash entry
                field ['a']
                value @undefined
            }

        spec 'a */ b'
            e = expression [id 'a']
            e: add operator '*/' expression (complex expression [id 'b'])
        
            (e: hash entry?) should contain fields {
                is semantic failure
            }

    spec 'definition'
        spec 'a = b'
            e = expression [id 'a']
            
            (e: definition (variable 'b'): expression?) should contain fields {
                is definition
                target {variable ['a']}
                source {variable ['b']}
            }
                
        spec 'a */ b = c'
            e = expression [id 'a']
            e: add operator '*/' expression (complex expression [id 'b'])
            
            (e: definition (variable 'c')) should contain fields {
                is definition
                target {
                    is field reference
                    object {variable ['a']}
                    name ['*/']
                }
                    
                source {
                    is block
                    parameters [{variable ['b']}]
                    body {statements [{variable ['c']}]}
                }
            }
