cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'

require './parserAssertions.pogo'

loc = {
    first line 1
    last line 1
    first column 3
    last column 8
}

id (name) = cg: loc (cg: identifier (name), loc)
variable (name) = cg: variable [name]
block (name) = cg: block [] (cg: statements [variable (name)])

describe 'macros'
    describe 'if'
        it 'if'
            (expression 'if (true) @{a}') should contain fields {
                is if expression
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        it 'if else'
            (expression 'if (true) @{a} else @{b}') should contain fields {
                is if expression
                _else {statements [{variable ['b']}]}
                cases [{
                    condition {variable ['true']}
                    action {statements [{variable ['a']}]}
                }]
            }
        
        it 'if else if'
            (expression 'if (true) @{a} else if (false) @{b}') should contain fields {
                is if expression
                _else = undefined
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
                
        it 'if else if else'
            (expression 'if (true) @{a} else if (false) @{b} else @{c}') should contain fields {
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

    it 'for'
        (expression 'for (n = 0, n < 10, n = n + 1) @{a}') should contain fields {
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
    
    describe 'for @(item) in (items) @{}'
        it 'generates for (var item in items) {}'
            (expression 'for @(item) in (items) @{item}') should contain fields {
                is for in
                iterator {variable ['item']}
                collection {variable ['items']}
                statements {
                    statements [
                        {variable ['item']}
                    ]
                }
            }

    it 'while'
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

    describe 'try'
        it 'try catch'
            (expression 'try @{a} catch @(ex) @{b}') should contain fields {
                is try statement
                body {
                    statements [
                        {variable ['a']}
                    ]
                }
                catch body {
                    is block
                    parameters [{variable ['ex']}]
                    body {
                        statements [
                            {variable ['b']}
                        ]
                    }
                }
                finally body = undefined
            }

        it 'try finally'
            (expression 'try @{a} finally @{b}') should contain fields {
                is try statement
                body {
                    statements [
                        {variable ['a']}
                    ]
                }
                catch body = undefined
                finally body {
                    statements [
                        {variable ['b']}
                    ]
                }
            }

        it 'try catch finally'
            (expression 'try @{a} catch @(ex) @{b} finally @{c}') should contain fields {
                is try statement
                body {
                    statements [
                        {variable ['a']}
                    ]
                }
                catch body {
                    is block
                    parameters [{variable ['ex']}]
                    body {
                        statements [
                            {variable ['b']}
                        ]
                    }
                }
                finally body {
                    statements [
                        {variable ['c']}
                    ]
                }
            }

    describe 'new'
        it 'constructor with arguments'
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

        it 'constructor without arguments'
            (expression 'new (Date)') should contain fields {
                is new operator
                function call {variable ['Date']}
            }

        it 'constructor without arguments, just variable'
            (expression 'new (Date)') should contain fields {
                is new operator
                function call {variable ['Date']}
            }

    describe 'multi argument operators'
        it 'a + b'
            (expression 'a + b') should contain fields {
                is operator
                operator '+'
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }

        it 'a + b + c'
            (expression 'a + b + c') should contain fields {
                is operator
                operator '+'
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                    {variable ['c']}
                ]
            }
    
    describe '=='
        it 'generates ==='
            (expression 'a == b') should contain fields {
                is operator
                operator '==='
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
    
    describe '!='
        it 'generates !=='
            (expression 'a != b') should contain fields {
                is operator
                operator '!=='
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
        
    describe '<:'
        it 'generates instanceof'
            (expression 'a <: b') should contain fields {
                is operator
                operator 'instanceof'
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
        
    describe 'in'
        it 'generates in'
            (expression '(a) in (b)') should contain fields {
                is operator
                operator 'in'
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
    
    describe 'JavaScript operators'
        it generates unary (op) =
            it "generates unary #(op)"
                (expression "#(op) a") should contain fields {
                    is operator
                    operator (op)
                    arguments [
                        {variable ['a']}
                    ]
                }
        
        it generates binary (op) =
            it "generates binary #(op)"
                (expression "a #(op) b") should contain fields {
                    is operator
                    operator (op)
                    arguments [
                        {variable ['a']}
                        {variable ['b']}
                    ]
                }
    
        it generates unary '!'
        it generates unary '~'
        it generates unary '+'
        it generates unary '-'
        
        it generates binary '+'
        it generates binary '*'
        it generates binary '/'
        it generates binary '-'
        it generates binary '%'
        it generates binary '<<'
        it generates binary '>>'
        it generates binary '>>>'
        it generates binary '>'
        it generates binary '>='
        it generates binary '<'
        it generates binary '<='
        it generates binary '&'
        it generates binary '^'
        it generates binary '|'
        it generates binary '&&'
        it generates binary '||'
