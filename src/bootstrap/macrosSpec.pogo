require 'cupoftea'
cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'

expression @e =
    cg: complex expression [e]: expression?

id @name = cg: identifier @name
variable @name = cg: variable [name]
block @name = cg: block [] (cg: statements [variable @name])

spec 'macros'
    spec 'if'
        spec 'if'
            (expression [id 'if'. variable 'true'. block 'a']) should contain fields {
                is if expression
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        spec 'if else'
            (expression [id 'if'. variable 'true'. block 'a'. id 'else'. block 'b']) should contain fields {
                is if expression
                _else {statements [{variable ['b']}]}
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        spec 'if else if'
            (expression [id 'if'. variable 'true'. block 'a'. id 'else'. id 'if'. variable 'false'. block 'b']) should contain fields {
                is if expression
                _else @undefined
                cases [
                    {
                        condition {variable ['true']}
                        action {statements [{variable ['a']}]}
                    }
                    {
                        condition {variable ['false']}
                        action {statements [{variable ['b']}]}
                    }
                ]
            }
                
        spec 'if else if else'
            (expression [id 'if'. variable 'true'. block 'a'. id 'else'. id 'if'. variable 'false'. block 'b'. id 'else'. block 'c']) should contain fields {
                is if expression
                _else {statements [{variable ['c']}]}
                cases [
                    {
                        condition {variable ['true']}
                        action {statements [{variable ['a']}]}
                    }
                    {
                        condition {variable ['false']}
                        action {statements [{variable ['b']}]}
                    }
                ]
            }

        spec 'operators'
          spec 'a + b'
            op = cg: operator expression (cg: complex expression [[id 'a']])
            op: add operator '+' expression (cg: complex expression [[id 'b']])
            
            (op: expression?) should contain fields {
              is operator
              operator '+'
              arguments [
                {variable ['a']}
                {variable ['b']}
              ]
            }
              
          spec 'a + b + c'
            op = cg: operator expression (cg: complex expression [[id 'a']])
            op: add operator '+' expression (cg: complex expression [[id 'b']])
            op: add operator '+' expression (cg: complex expression [[id 'c']])
            
            (op: expression?) should contain fields {
              is operator
              operator '+'
              arguments [
                {variable ['a']}
                {variable ['b']}
                {variable ['c']}
              ]
            }
