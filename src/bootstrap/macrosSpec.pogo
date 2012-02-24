require 'cupoftea'
cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'

require './parserAssertions.pogo'

loc = {
    first line 1
    last line 1
    first column 3
    last column 8
}

id @name = cg: loc (cg: identifier @name) @loc
variable @name = cg: variable [name]
block @name = cg: block [] (cg: statements [variable @name])

spec 'macros'
    spec 'if'
        spec 'if'
            (expression 'if @true @{a}') should contain fields {
                is if expression
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        spec 'if else'
            (expression 'if @true @{a} else @{b}') should contain fields {
                is if expression
                _else {statements [{variable ['b']}]}
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        spec 'if else if'
            (expression 'if @true @{a} else if @false @{b}') should contain fields {
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
            (expression 'if @true @{a} else if @false @{b} else @{c}') should contain fields {
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

    spec 'for'
        (expression 'for (n = 0. n < 10. n = n + 1) @{a}') should contain fields {
            is for
            initialization {
                is definition
                source {integer 0}
                target {variable ['n']}
            }
            test {
                is operator
                operator '<'
                arguments [
                    {variable ['n']}
                    {integer 10}
                ]
            }
            increment {
                is definition
                target {variable ['n']}
                source {
                    is operator
                    operator '+'
                    arguments [
                        {variable ['n']}
                        {integer 1}
                    ]
                }
            }
        }

    spec 'while'
        (expression 'while (n < 10) @{n}') should contain fields {
            is while
            test {
                is operator
                operator '<'
                arguments [
                    {variable ['n']}
                    {integer 10}
                ]
            }
            statements {
                statements [
                    {variable ['n']}
                ]
            }
        }

    spec 'new'
        spec 'constructor with arguments'
            (expression 'new (Date 2011 2 21)') should contain fields {
                is new operator
                function call {
                    is function call
                    function {variable ['Date']}
                    arguments [
                        {integer 2011}
                        {integer 2}
                        {integer 21}
                    ]
                }
            }

        spec 'constructor without arguments'
            (expression 'new (Date)') should contain fields {
                is new operator
                function call {variable ['Date']}
            }

        spec 'constructor without arguments, just variable'
            (expression 'new @Date') should contain fields {
                is new operator
                function call {variable ['Date']}
            }

    spec 'operators'
      spec 'a + b'
        (expression 'a + b') should contain fields {
          is operator
          operator '+'
          arguments [
            {variable ['a']}
            {variable ['b']}
          ]
        }
          
      spec 'a + b + c'
        (expression 'a + b + c') should contain fields {
          is operator
          operator '+'
          arguments [
            {variable ['a']}
            {variable ['b']}
            {variable ['c']}
          ]
        }
