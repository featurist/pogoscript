require './assertions'

parser = require '../src/bootstrap/parser'
require './parserAssertions'
create terms () = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()

describe 'parser'
    terms = nil

    before
        terms = create terms ()

    describe 'terminals'
        it 'integer'
            (expression '5') should contain fields {
                integer 5
            }

        it 'float'
            (expression '5.6') should contain fields {
                float 5.6
            }

        describe 'variables'
            it 'simple'
                (expression 'total weight') should contain fields {
                    variable ['total', 'weight']
                }

            it 'can use $ as a variable'
                (expression '$') should contain fields {
                    variable ['$']
                }
        
        describe 'strings'
            it 'simple string'
                (expression '''a string''') should contain fields {
                    is string
                    string 'a string'
                }
                    
            it 'string with single quotes'
                (expression '''''''alright!'''' he said''') should contain fields {
                    is string
                    string '''alright!'' he said'
                }
                    
            it 'string with backslash'
                (expression "'one \\ two'") should contain fields {
                    is string
                    string "one \\ two"
                }
                    
            it 'multiline string'
                (expression "  'one\n   two'") should contain fields {
                    is string
                    string "one\ntwo"
                }
                    
            it 'multiline double-quote string'
                (expression "  \"one\n   two\"") should contain fields {
                    is string
                    string "one\ntwo"
                }
                    
            it 'two multiline string in function'
                (expression "x 'one\n   two' y \"three\n           four\"") should contain fields {
                    is function call
                    function {variable ['x', 'y']}
                    function arguments [
                        {string "one\ntwo"}
                        {string "three\nfour"}
                    ]
                }

        describe 'interpolated strings'
            it 'simple'
                (expression '"a string"') should contain fields {
                    is string
                    string 'a string'
                }

            it 'empty'
                (expression '""') should contain fields {
                    is string
                    string ''
                }

            it 'with newline'
                (expression '"one\ntwo"') should contain fields {
                    string "one\ntwo"
                }

            it 'with newline escape and indentation should not remove indentation'
                (expression '  "one\n    two"') should contain fields {
                    string "one\n    two"
                }

            it 'with indentation'
                (expression "  \"one\n   two\"") should contain fields {
                    string "one\ntwo"
                }

            it 'with single variable expression'
                (expression '"a boat #(boat length) meters in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {variable ['boat', 'length']}
                        {string ' meters in length'}
                    ]
                }

            it 'with hash # character at end'
                (expression '"this is a hash: #"') should contain fields {
                    is string
                    string 'this is a hash: #'
                }

            it 'with hash # character in middle'
                (expression '"this is a hash: #, ok?"') should contain fields {
                    is string
                    string 'this is a hash: #, ok?'
                }

            it 'with escaped #'
                (expression '"a boat \#(boat length) meters in length"') should contain fields {
                    is string
                    string 'a boat #(boat length) meters in length'
                }

            it 'with complex expression'
                (expression '"a boat #(lookup boat length from (boat database)) meters in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {
                            function {variable ['lookup', 'boat', 'length', 'from']}
                            function arguments [{variable ['boat', 'database']}]
                        }
                        {string ' meters in length'}
                    ]
                }
                
            it 'in block'
                (expression "abc =\n    \"\#(stuff)\"") should contain fields {
                    is definition
                    target {
                        is variable
                        variable ['abc']
                    }
                    source {
                        is variable
                        variable ['stuff']
                    }
                }

            it 'with inner interpolation'
                (expression '"a boat #("#(boat length) meters") in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {
                            is interpolated string
                            components [
                                {variable ['boat', 'length']}
                                {string ' meters'}
                            ]
                        }
                        {string ' in length'}
                    ]
                }

        describe 'sub expressions'
            it 'single expression'
                (expression '(x)') should contain fields {variable ['x']}
        
        describe 'lists'
            it 'empty'
                (expression '[]') should contain fields {
                    is list
                    items []
                }
            
            it 'one item'
                (expression '[1]') should contain fields {
                    is list
                    items [{integer 1}]
                }
            
            it 'two items'
                (expression '[1, 2]') should contain fields {
                    is list
                    items [
                        {integer 1}
                        {integer 2}
                    ]
                }
            
            it 'two items separated by newlines'
                (expression "[\n  1\n  2\n]") should contain fields {
                    is list
                    items [
                        {integer 1}
                        {integer 2}
                    ]
                }
        
        describe 'hashes'
            it 'empty hash'
                (expression '{}') should contain fields {
                    is hash
                    entries []
                }
                    
            it 'hash with one entry'
                (expression '{port 1234}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }
                    ]
                }
                    
            it 'hash with two entries'
                (expression '{port 1234, ip address ''1.1.1.1''}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }
                        {
                            field ['ip', 'address']
                            value {string '1.1.1.1'}
                        }
                    ]
                }
                    
            it 'hash with two entries on different lines'
                (expression "{port = 1234\nip address = '1.1.1.1'}") should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }   
                        {
                            field ['ip', 'address']
                            value {string '1.1.1.1'}
                        }
                    ]
                }
                    
            it 'hash with string with assignment'
                (expression "{'port' = 1234}") should contain fields {
                    is hash
                    entries [
                        {
                            field {string 'port'}
                            value {integer 1234}
                        }
                    ]
                }
                    
            it 'values can be specified on a new line'
                (expression "{
                                 height =
                                     80
                             }") should contain fields {
                    is hash
                    entries [
                        {
                            field ['height']
                            value {integer 80}
                        }
                    ]
                }
                    
            it 'should allow methods to be defined, redefining self'
                (expression '{say hi to (name, greeting: nil) = print (name)}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['say', 'hi', 'to']
                            value {
                                is block
                                redefines self

                                body {
                                    statements [
                                        {
                                            is function call
                                            function {variable ['print']}
                                        }
                                    ]
                                }

                                parameters [{variable ['name']}]

                                optional parameters [{
                                    is hash entry
                                    field ['greeting']
                                }]
                            }
                        }
                    ]
                }
                    
            it 'hash with true entry'
                (expression '{port 1234, readonly}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }   
                        {
                            field ['readonly']
                            value (undefined)
                        }
                    ]
                }

    describe 'function calls'
        it 'function call'
            (expression 'touch (file)') should contain fields {
                function {variable ['touch']}
                function arguments [{variable ['file']}]
            }

        it 'function call with two arguments in parens'
            (expression 'f (a, b)') should contain fields {
                function {variable ['f']}
                function arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
            
        it 'two expressions'
            (expression '(x, y)') should contain fields {
                is function call
                function {variable ['x']}
                function arguments [
                    {variable ['y']}
                ]
            }

        it 'function call with splat argument'
            (expression 'touch (files) ...') should contain fields {
                function {variable ['touch']}
                function arguments [
                  {variable ['files']}
                  {is splat}
                ]
            }

        it 'function call with no argument'
            (expression 'delete everything ()') should contain fields {
                function {variable ['delete', 'everything']}
                function arguments []
            }

        it 'async function call with no arguments'
            (expression 'delete everything!') should contain fields (
                terms.async statements [
                    terms.function call (terms.variable ['delete', 'everything'], [], async: true)
                ].statements.0
            )

        it 'function call with block with parameters'
            (expression "with file (file) @(stream)\n  stream") should contain fields {
                function {variable ['with', 'file']}
                function arguments [
                    {variable ['file']}
                    {
                        body {statements [{variable ['stream']}]}
                        parameters [{variable ['stream']}]
                    }
                ]
            }

        it 'function call with block with long parameters'
            (expression "open database @(database connection)\n  database connection") should contain fields {
                function {variable ['open', 'database']}
                function arguments [
                    {
                        parameters [
                            {variable ['database', 'connection']}
                        ]
                        body {statements [{variable ['database', 'connection']}]}
                    }
                ]
            }

        it 'function call with two blocks with parameters'
            (expression 'name @(x) @{x} @ (y) @ {y}') should contain fields {
                function {variable ['name']}
                function arguments [
                    {
                        body {statements [{variable ['x']}]}
                        parameters [{variable ['x']}]
                    }
                    {
                        body {statements [{variable ['y']}]}
                        parameters [{variable ['y']}]
                    }
                ]
            }

        it 'function call with two optional arguments'
            (expression 'name (a, port: 34, server: s)') should contain fields {
                function {variable ['name']}
                function arguments [
                    {variable ['a']}
                ]
                optional arguments [
                    {
                        field ['port']
                        value {integer 34}
                    }
                    {
                        field ['server']
                        value {variable ['s']}
                    }
                ]
            }
    
    describe 'object operations'
        it 'method call'
            (expression 'object.method (argument)') should contain fields {
                is method call
                object {variable ['object']}
                name ['method']
                method arguments [{variable ['argument']}]
            }
        
        it 'method call with optional arguments'
            (expression 'object.method (argument, view: view)') should contain fields {
                is method call
                object {variable ['object']}
                name ['method']
                method arguments [{variable ['argument']}]
                optional arguments [
                    {field ['view'], value {variable ['view']}}
                ]
            }
        
        it 'field reference'
            (expression 'object.field') should contain fields {
                is field reference
                object {variable ['object']}
                name ['field']
            }
        
        it 'field reference with newline'
            (expression "object.\nfield") should contain fields {
                is field reference
                object {variable ['object']}
                name ['field']
            }
        
        it 'indexer'
            (expression 'object.(x)') should contain fields {
                is indexer
                object {variable ['object']}
                indexer {variable ['x']}
            }
        
        it 'parses no argument method with ()'
            (expression 'object.method()') should contain fields {
                is method call
                object {variable ['object']}
                name ['method']
                method arguments []
            }
        
        it 'parses no argument method with () and field'
            (expression 'object.method().field') should contain fields {
                is field reference
                object {
                    is method call
                    object {variable ['object']}
                    name ['method']
                    method arguments []
                }
                name ['field']
            }
        
        it 'parses no argument method with ! and field'
            (expression 'object.method! . field') should contain fields (
                terms.async statements [
                    terms.field reference (
                        terms.method call (
                            terms.variable ['object']
                            ['method']
                            []
                            async: true
                        )
                        ['field']
                    )
                ].statements.0
            )
        
        it 'parses no argument method with ! and field'
            (expression 'object.method!.field') should contain fields (
                terms.async statements [
                    terms.field reference (
                        terms.method call (
                            terms.variable ['object']
                            ['method']
                            []
                            async: true
                        )
                        ['field']
                    )
                ].statements.0
            )

    describe 'blocks'
        it 'empty block'
            (expression '@{}') should contain fields {
                is block
                parameters []
                redefines self (false)
                body {statements []}
            }
                
        it 'block'
            (expression '@{x, y}') should contain fields {
                is block
                parameters []
                redefines self (false)
                body {statements [
                    {variable ['x']}
                    {variable ['y']}
                ]}
            }

        it 'block with parameter'
            (expression "@(x)\n  x, y") should contain fields {
                is block
                parameters [{variable ['x']}]
                redefines self (false)
                body {
                    statements [
                        {variable ['x']}
                        {variable ['y']}
                    ]
                }
            }
        
        it 'block in parens'
            (expression "(one\n  two\n)") should contain fields {
                is function call
                function {variable ['one']}
                function arguments [
                    {
                        is block
                        body {
                            statements [
                                {variable ['two']}
                            ]
                        }
                    }
                ]
            }

        it 'block with parameter, redefining self'
            (expression '@(x) => @{x, y}') should contain fields {
                is block
                parameters [{variable ['x']}]
                redefines self (true)
                body {
                    statements [
                        {variable ['x']}
                        {variable ['y']}
                    ]
                }
            }
    
    describe 'statements'
        it 'can be separated by commas (,)'
            (statements 'a, b') should contain fields {
                statements [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
            
        it 'can be separated by unix new lines'
            (statements "a\nb") should contain fields {
                statements [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
            
        it 'can be separated by windows new lines'
            (statements "a\r\nb") should contain fields {
                statements [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
            
        it 'windows indentation'
            (statements "app (stuff) =\r
                           ok\r
                         \r
                         url (path) =\r
                           ok") should contain fields {
                statements [
                    {is definition}
                    {is definition}
                ]
            }

    describe 'operators'
        it 'should be lower precedence than object operation'
            (expression 'o.m 2 +- o.x') should contain fields {
                is method call
                object {
                    is method call
                    object {variable ['o']}
                    name ['m']
                    method arguments [{integer 2}]
                }
                    
                name ['+-']
                method arguments [
                    {
                        is field reference
                        object {variable ['o']}
                        name ['x']
                    }
                ]
            }
                
        it 'parses backslash'
            (expression "2 +\\+ 1") should contain fields {
                is method call
                object {integer 2}
                    
                name ["+\\+"]
                method arguments [
                    {integer 1}
                ]
            }
                
        it 'unary operators should be higher precedence than binary operators'
            (expression 'a && ! b') should contain fields {
                is operator
                operator '&&'
                
                operator arguments [
                    {variable ['a']}
                    {
                        is operator
                        operator '!'
                        operator arguments [{variable ['b']}]
                    }
                ]
            }
                
        it 'can have newlines immediately after operator'
            (expression "a &&\nb") should contain fields {
                is operator
                operator '&&'
                
                operator arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
      
    describe 'assignment'
        it 'assignment'
            (expression 'x = y') should contain fields {
                is definition
                target {variable ['x']}
                source {variable ['y']}
            }

        it 'assignment on next line'
            (expression "x =\n  y") should contain fields {
                is definition
                target {variable ['x']}
                source {variable ['y']}
            }

        describe 'function definition'
            it 'function with one parameter'
                (expression 'func (x) = x') should contain fields {
                    is definition
                    target {variable ['func']}
                    source {
                        parameters [{variable ['x']}]
                        body {statements [{variable ['x']}]}
                    }
                }

            it 'function with one parameter, and one optional parameter'
                (expression 'func (x, port: 80) = x') should contain fields {
                    is definition
                    target {variable ['func']}
                    source {
                        parameters [{variable ['x']}]
                        optional parameters [{field ['port'], value {integer 80}}]
                        body {statements [{variable ['x']}]}
                    }
                }

        it 'field assignment'
            (expression 'o.x = y') should contain fields {
                is definition
                target {
                    is field reference
                    object {variable ['o']}
                    name ['x']
                }

                source {variable ['y']}
            }

        it 'index assignment'
            (expression 'o.(x) = y') should contain fields {
                is definition
                target {
                    is indexer
                    object {variable ['o']}
                    indexer {variable ['x']}
                }

                source {variable ['y']}
            }

        it 'assignment from field'
            (expression 'x = y.z') should contain fields {
                is definition
                target {variable ['x']}
                source {
                    is field reference
                    object {
                        variable ['y']
                    }

                    name ['z']
                }
            }

        it 'assignment of async function'
            (expression 'x! = 8') should contain fields {
                is definition
                target {variable ['x']}
                source {
                    is block
                    parameters []
                    body {
                        statements [
                            {integer 8}
                        ]
                    }
                }
            }

        it 'definition of function with no arguments, using empty parens "()"'
            (expression 'x () = 8') should contain fields {
                is definition
                target {variable ['x']}
                source {
                    is block
                    parameters []
                    body {
                        statements [{integer 8}]
                    }
                }
            }

        it 'assignment from method call'
            (expression 'x = y.z (a)') should contain fields {
                is definition
                target {variable ['x']}
                source {
                    is method call
                    object {
                        variable ['y']
                    }

                    name ['z']
                    method arguments [{variable ['a']}]
                }
            }

        it 'field assignment from method call'
            (expression 'i.x = y.z (a)') should contain fields {
                is definition
                target {
                    is field reference
                    object {variable ['i']}
                    name ['x']
                }

                source {
                    is method call
                    object {
                        variable ['y']
                    }

                    name ['z']
                    method arguments [{variable ['a']}]
                }
            }
    
    describe 'regexps'
        it 'simple'
            (expression 'r/abc/') should contain fields {
                is reg exp
                pattern 'abc'
            }

        it 'with options'
            (expression 'r/abc/img') should contain fields {
                is reg exp
                pattern 'abc'
                options 'img'
            }

        it 'with escaped back ticks'
            (expression 'r/abc\/def\/ghi/') should contain fields {
                is reg exp
                pattern 'abc/def/ghi'
            }

        it 'with various escapes'
            (expression 'r/abc\/def\nghi\/jkl/') should contain fields {
                is reg exp
                pattern 'abc/def\nghi/jkl'
            }

        it 'with newline'
            (expression "a = r/abc\n      def/") should contain fields {
                is definition
                target {
                    is variable
                    variable ['a']
                }
                source {
                    is reg exp
                    pattern "abc\\ndef"
                }
            }
    
    describe 'comments'
        it 'should not treat comment-like syntax as comments in strings'
            (statements "get 'http://pogoscript.org/'") should contain fields {
                is statements
                statements [{
                    is function call
                    function {variable ['get']}
                    function arguments [
                        {string 'http://pogoscript.org/'}
                    ]
                }]
            }
            
        describe 'should allow one-line C++ style comments, as in: // this is a comment'
            it 'when at the end of a line'
                (statements "a // this is a comment\nb") should contain fields {
                    is statements
                    statements [
                        {variable ['a']}
                        {variable ['b']}
                    ]
                }

            it 'before an indented block'
                (statements "a // this is a comment\n  b") should contain fields {
                    is statements
                    statements [{
                        is function call
                        function {variable ['a']}
                        function arguments [{
                            is block
                            body {
                                statements [
                                    {variable ['b']}
                                ]
                            }
                        }]
                    }]
                }

            it 'when at end of file'
                (statements "a // this is a comment") should contain fields {
                    is statements
                    statements [
                        {variable ['a']}
                    ]
                }

            it 'when between lines'
                (statements "a\n// this is a comment\nb") should contain fields {
                    is statements
                    statements [
                        {variable ['a']}
                        {variable ['b']}
                    ]
                }

        describe 'should allow multi-line C style comments, as in: /* this is a comment */'
            it 'when on one line'
                (statements "a /* comment */ b") should contain fields {
                    statements [
                        {variable ['a', 'b']}
                    ]
                }

            it 'when there are two'
                (statements "a /* comment */ b /* another comment */ c") should contain fields {
                    statements [
                        {variable ['a', 'b', 'c']}
                    ]
                }

            it 'when between lines'
                (statements "a\n/* comment */\nb\n/* another comment */\nc") should contain fields {
                    statements [
                        {variable ['a']}
                        {variable ['b']}
                        {variable ['c']}
                    ]
                }

            it 'when it contains a * character'
                (statements "a /* sh*t */ b") should contain fields {
                    statements [
                        {variable ['a', 'b']}
                    ]
                }

            it 'when it covers two lines'
                (statements "a /* line one\nline two */ b") should contain fields {
                    statements [{
                        is variable
                        variable ['a', 'b']
                    }]
                }

            it 'when it is terminated by the end of file'
                (statements "a /* comment to eof") should contain fields {
                    statements [
                        {variable ['a']}
                    ]
                }

            it 'when it extends to the end of the file'
                (statements "a /* comment to end */") should contain fields {
                    statements [
                        {variable ['a']}
                    ]
                }

            it 'when it extends to the end of the file followed by newline'
                (statements "a /* comment to end */\n") should contain fields {
                    statements [
                        {variable ['a']}
                    ]
                }

    it 'lexer'
        create parser = require '../src/bootstrap/parser'.create parser
        parser = create parser (terms: terms)
        tokens = parser.lex 'a (b)'
        (tokens) should contain fields [
            ['identifier', 'a']
            ['(']
            ['identifier', 'b']
            [')']
            ['eof']
        ]

    it 'ignores hash bang #!, at the beginning of the file'
        (statements '#! /usr/bin/env pogo
                     a
                     b') should contain fields (
            terms.async statements [
                terms.variable ['a']
                terms.variable ['b']
            ]
        )
