require './assertions'
require './parserAssertions'
terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()

loc = {
    first line 1
    last line 1
    first column 3
    last column 8
}

describe 'macros'
    describe 'if'
        it 'if'
            (macro expression 'if (true) @{a}') should contain fields {
                is if expression
                cases [{
                    condition = {variable ['true']}
                    body = {statements [{variable ['a']}]}
                }]
            }
        
        it 'if else'
            (macro expression 'if (true) @{a} else @{b}') should contain fields {
                is if expression
                else body {statements [{variable ['b']}]}
                cases [{
                    condition = {variable ['true']}
                    body = {statements [{variable ['a']}]}
                }]
            }
        
        it 'if else if'
            (macro expression 'if (true) @{a} else if (false) @{b}') should contain fields {
                is if expression
                else body = undefined
                cases [
                    {
                        condition = {variable ['true']}
                        body = {statements [{variable ['a']}]}
                    }
                    {
                        condition = {variable ['false']}
                        body = {statements [{variable ['b']}]}
                    }
                ]
            }
                
        it 'if else if else'
            (macro expression 'if (true) @{a} else if (false) @{b} else @{c}') should contain fields {
                is if expression
                else body {statements [{variable ['c']}]}
                cases [
                    {
                        condition = {variable ['true']}
                        body = {statements [{variable ['a']}]}
                    }
                    {
                        condition = {variable ['false']}
                        body = {statements [{variable ['b']}]}
                    }
                ]
            }

    it 'for'
        (macro expression 'for (n = 0, n < 10, n = n + 1) @{a}') should contain fields {
            is for
            initialization {
                is definition
                source {integer 0}
                target {variable ['n']}
            }
            test {
                is operator
                operator '<'
                operator arguments [
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
                    operator arguments [
                        {variable ['n']}
                        {integer 1}
                    ]
                }
            }
            statements {
                is statements
                statements [
                    {variable ['a']}
                ]
            }
        }

    it 'for with return in body'
        (macro expression 'for (n = 0, n < 10, n = n + 1) @{return (a)}') should contain fields {
            is for
            initialization {
                is definition
                source {integer 0}
                target {variable ['n']}
            }
            test {
                is operator
                operator '<'
                operator arguments [
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
                    operator arguments [
                        {variable ['n']}
                        {integer 1}
                    ]
                }
            }
            statements {
                is statements
                statements [
                    {
                        is definition
                        source {}
                        target {is variable, name ['for', 'result']}
                    }
                    {
                        is if expression
                        cases [
                            {
                                condition = {
                                    is sub expression
                                    expression {
                                        is function call
                                        function {
                                            is closure
                                            parameters [{variable ['n']}]
                                            body {
                                                is statements
                                                statements [
                                                    {
                                                        is definition
                                                        target {is variable, name ['for', 'result']}
                                                        source {variable ['a']}
                                                    }
                                                    {is return, expression {boolean = true}}
                                                ]
                                            }
                                        }
                                        function arguments [{variable ['n']}]
                                    }
                                }
                                body = {
                                    is statements
                                    statements [
                                        {is return, expression {is variable, name ['for', 'result']}}
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }

    describe 'for each'
        it 'generates for'
            (macro statements 'for each @(item) in (items) @{item}') should contain fields {
                statements [
                    terms.definition (terms.generated variable ['items'], terms.variable ['items'])
                    terms.for expression (
                        terms.definition (terms.generated variable ['i'], terms.integer 0)
                        terms.operator (
                            '<'
                            [
                                terms.generated variable ['i']
                                terms.field reference (terms.generated variable ['items'], ['length'])
                            ]
                        )
                        terms.increment (terms.generated variable ['i'])
                        terms.statements [
                            terms.definition (
                                terms.variable ['item']
                                terms.indexer (
                                    terms.generated variable ['items']
                                    terms.generated variable ['i']
                                )
                            )
                            terms.variable ['item']
                        ]
                    )
                ]
            }
    
    describe 'for @(item) in (items) @{}'
        it 'generates for (var item in items) {}'
            (macro expression 'for @(item) in (items) @{item}') should contain fields {
                is for in
                iterator {variable ['item']}
                collection {variable ['items']}
                statements {
                    is sub expression
                    expression {
                        is function call
                        function {
                            is closure
                            parameters [{variable ['item']}]
                            body {
                                is statements
                                statements [
                                    {variable ['item']}
                                ]
                            }
                        }
                        function arguments [{variable ['item']}]
                    }
                }
            }

    it 'while'
        (macro expression 'while (n < 10) @{n}') should contain fields {
            is while
            condition {
                is operator
                operator '<'
                operator arguments [
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
            (macro expression 'try @{a} catch (ex) @{b}') should contain fields {
                is try expression
                body {
                    statements [
                        {variable ['a']}
                    ]
                }
                catch body {
                    statements [
                        {variable ['b']}
                    ]
                }
                catch parameter {variable ['ex']}
                finally body = nil
            }

        it 'try finally'
            (macro expression 'try @{a} finally @{b}') should contain fields {
                is try expression
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
            (macro expression 'try @{a} catch (ex) @{b} finally @{c}') should contain fields {
                is try expression
                body {
                    statements [
                        {variable ['a']}
                    ]
                }
                catch body {
                    statements [
                        {variable ['b']}
                    ]
                }
                catch parameter {variable ['ex']}
                finally body {
                    statements [
                        {variable ['c']}
                    ]
                }
            }

    describe 'new'
        it 'constructor with arguments'
            (macro expression 'new (Date 2011 2 21)') should contain fields {
                is new operator
                function call {
                    is function call
                    function {variable ['Date']}
                    function arguments [
                        {integer 2011}
                        {integer 2}
                        {integer 21}
                    ]
                }
            }

        it 'constructor without arguments, just variable'
            (macro expression 'new (Date)') should contain fields {
                is new operator
                function call {variable ['Date']}
            }

        it 'with splat arguments'
            (macro statements ('new (Stack (args, ...))')) should contain fields (
                terms.statements [
                    terms.definition (
                        terms.generated variable ['c']
                        terms.closure (
                            []
                            terms.statements [
                                terms.function call (
                                    terms.variable ['Stack']
                                    [
                                        terms.variable ['args']
                                        terms.splat ()
                                    ]
                                    pass this to apply: true
                                )
                            ]
                            return last statement: false
                        )
                    )
                    terms.definition (
                        terms.field reference (
                            terms.generated variable ['c']
                            ['prototype']
                        )
                        terms.field reference (
                            terms.variable ['Stack']
                            ['prototype']
                        )
                    )
                    terms.new operator (terms.generated variable ['c'])
                ]
            )
    
    describe '=='
        it 'generates ==='
            (macro expression 'a == b') should contain fields {
                is operator
                operator '==='
                operator arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
    
    describe '!='
        it 'generates !=='
            (macro expression 'a != b') should contain fields {
                is operator
                operator '!=='
                operator arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
        
    describe '::'
        it 'generates instanceof'
            (macro expression 'a :: b') should contain fields {
                is operator
                operator 'instanceof'
                operator arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
        
    describe 'in'
        it 'generates in'
            (macro expression '(a) in (b)') should contain fields {
                is operator
                operator 'in'
                operator arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
    
    describe 'break'
        it 'generates break statement'
            (macro expression 'break') should contain fields {
                is break
            }
    
    describe 'return'
        it 'generates void return statement'
            (macro expression 'return') should contain fields {
                is return
                expression = undefined
            }
    
    describe 'nil'
        it 'generates void 0'
            (macro expression 'nil') should contain fields {
                is nil
            }
    
    describe 'JavaScript operators'
        it generates unary (op) =
            it "generates unary #(op)"
                (macro expression "#(op) a") should contain fields {
                    is operator
                    operator (op)
                    operator arguments [
                        {variable ['a']}
                    ]
                }
        
        it generates binary (op) =
            it "generates binary #(op)"
                (macro expression "a #(op) b") should contain fields {
                    is operator
                    operator (op)
                    operator arguments [
                        {variable ['a']}
                        {variable ['b']}
                    ]
                }
    
        it generates unary '!'
        it generates unary '~'
        it generates unary '+'
        it generates unary '-'
        it generates unary '--'
        it generates unary '++'
        
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
