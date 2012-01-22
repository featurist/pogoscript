require 'cupoftea'
require './assertions.pogo'

parse = require './parser.pogo': parse

assume @term is module with statements @action =
    if (term: is module)
        action (term: statements)
    else
        throw (new (Error ('expected module, but found ' + term)))

assume @statements has just one statement @action =
    if (statements: statements: length == 1)
        action (statements: statements: 0)
    else
        throw (new (Error ('expected statements to have just one statement, found ' + statements: statements: length)))

expression @source =
    term = parse @source
    assume @term is module with statements #statements
        assume @statements has just one statement #s
            s

spec 'parser'
    spec 'terminals'
        spec 'integer'
            (expression '5') should contain fields {
                integer 5
            }

        spec 'float'
            (expression '5.6') should contain fields {
                float 5.6
            }

        spec 'variables'
            spec 'simple'
                (expression 'total weight') should contain fields {
                    variable ['total'. 'weight']
                }
        
        spec 'strings'
            spec 'simple string'
                (expression '''a string''') should contain fields {
                    is string
                    string 'a string'
                }
                    
            spec 'string with single quotes'
                (expression '''''''alright!'''' he said''') should contain fields {
                    is string
                    string '''alright!'' he said'
                }
                    
            spec 'string with backslash'
                (expression "'one \\ two'") should contain fields {
                    is string
                    string "one \\ two"
                }
                    
            spec 'multiline string'
                (expression "  'one\n   two'") should contain fields {
                    is string
                    string "one\ntwo"
                }

        spec 'interpolated strings'
            spec 'simple'
                (expression '"a string"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a string'}
                    ]
                }

            spec 'with newline'
                (expression '"one\ntwo"') should contain fields {
                    is interpolated string
                    components [
                        {string "one\ntwo"}
                    ]
                }

            spec 'with indentation'
                (expression '"one\n  two"') should contain fields {
                    is interpolated string
                    components [
                        {string "one\n two"}
                    ]
                }

            spec 'indented string'
                (expression '  "one\n   two"') should contain fields {
                    is interpolated string
                    components [
                        {string "one\ntwo"}
                    ]
                }

            spec 'null string'
                (expression '""') should contain fields {
                    is interpolated string
                    components [
                    ]
                }

            spec 'with single identifier variable'
                (expression '"a boat @length meters in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {variable ['length']}
                        {string ' meters in length'}
                    ]
                }

            spec 'with single variable expression'
                (expression '"a boat @(boat length) meters in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {variable ['boat'. 'length']}
                        {string ' meters in length'}
                    ]
                }

            spec 'with complex expression'
                (expression '"a boat @(lookup boat length from (boat database)) meters in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {
                            function {variable ['lookup'. 'boat'. 'length'. 'from']}
                            arguments [{variable ['boat'. 'database']}]
                        }
                        {string ' meters in length'}
                    ]
                }

            spec 'with inner interpolation'
                (expression '"a boat @("@(boat length) meters") in length"') should contain fields {
                    is interpolated string
                    components [
                        {string 'a boat '}
                        {
                            is interpolated string
                            components [
                                {variable ['boat'. 'length']}
                                {string ' meters'}
                            ]
                        }
                        {string ' in length'}
                    ]
                }
        
        spec 'lists'
            spec 'empty'
                (expression '[]') should contain fields {
                    is list
                    items []
                }
            
            spec 'one item'
                (expression '[1]') should contain fields {
                    is list
                    items [{integer 1}]
                }
            
            spec 'two items'
                (expression '[1. 2]') should contain fields {
                    is list
                    items [
                        {integer 1}
                        {integer 2}
                    ]
                }
        
        spec 'hashes'
            spec 'empty hash'
                (expression '{}') should contain fields {
                    is hash
                    entries []
                }
                    
            spec 'hash with one entry'
                (expression '{port 1234}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }
                    ]
                }
                    
            spec 'hash with two entries'
                (expression '{port 1234, ip address ''1.1.1.1''}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }
                        {
                            field ['ip'. 'address']
                            value {string '1.1.1.1'}
                        }
                    ]
                }
                    
            spec 'hash with two entries on different lines'
                (expression '{port 1234. ip address ''1.1.1.1''}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }   
                        {
                            field ['ip'. 'address']
                            value {string '1.1.1.1'}
                        }
                    ]
                }
                    
            spec 'hash with true entry'
                (expression '{port 1234, readonly}') should contain fields {
                    is hash
                    entries [
                        {
                            field ['port']
                            value {integer 1234}
                        }   
                        {
                            field ['readonly']
                            value @undefined
                        }
                    ]
                }

    spec 'function calls'
        spec 'function call'
            (expression 'touch @file') should contain fields {
                function {variable ['touch']}
                arguments [{variable ['file']}]
            }

        spec 'function call with self argument'
            (expression 'touch @:file') should contain fields {
                function {variable ['touch']}
                arguments [
                    {
                        is field reference
                        object {variable ['self']}
                        name ['file']
                    }
                ]
            }

        spec 'function call with splat argument'
            (expression 'touch @files ...') should contain fields {
                function {variable ['touch']}
                arguments [
                  {variable ['files']}
                  {is splat}
                ]
            }

        spec 'function call with no argument'
            (expression 'delete everything!') should contain fields {
                function {variable ['delete'. 'everything']}
                arguments []
            }

        spec 'function call with block with parameters'
            (expression "with file \@file #stream\n  stream") should contain fields {
                function {variable ['with'. 'file']}
                arguments [
                    {variable ['file']}
                    {
                        body {statements [{variable ['stream']}]}
                        parameters [{
                            is parameter
                            expression {variable ['stream']}
                        }]
                    }
                ]
            }

        spec 'function call with block with long parameters'
            (expression "open database #(database connection)\n  database connection") should contain fields {
                function {variable ['open'. 'database']}
                arguments [
                    {
                        parameters [
                            {
                                is parameter
                                expression {variable ['database'. 'connection']}
                            }
                        ]
                        body {statements [{variable ['database'. 'connection']}]}
                    }
                ]
            }

        spec 'function call with two blocks with parameters'
            (expression 'name #x @{x} #y @ {y}') should contain fields {
                function {variable ['name']}
                arguments [
                    {
                        body {statements [{variable ['x']}]}
                        parameters [{
                            is parameter
                            expression {variable ['x']}
                        }]
                    }
                    {
                        body {statements [{variable ['y']}]}
                        parameters [{
                            is parameter
                            expression {variable ['y']}
                        }]
                    }
                ]
            }

        spec 'function call with two optional arguments'
            (expression 'name @a, port 34, server @s') should contain fields {
                function {variable ['name']}
                arguments [
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

        spec 'function call with no arguments and one optional argument'
            (expression 'start server, port 34') should contain fields {
                function {variable ['start'. 'server']}
                arguments []
                optional arguments [
                    {
                        field ['port']
                        value {integer 34}
                    }
                ]
            }
    
    spec 'object operations'
        spec 'method call'
            (expression 'object: method @argument') should contain fields {
                is method call
                object {variable ['object']}
                name ['method']
                arguments [{variable ['argument']}]
            }
        
        spec 'method call with optional arguments'
            (expression 'object: method @argument, view @view') should contain fields {
                is method call
                object {variable ['object']}
                name ['method']
                arguments [{variable ['argument']}]
                optional arguments [
                    {field ['view'], value {variable ['view']}}
                ]
            }
        
        spec 'field reference'
            (expression 'object: field') should contain fields {
                is field reference
                object {variable ['object']}
                name ['field']
            }
        
        spec 'field reference with newline'
            (expression "object:\nfield") should contain fields {
                is field reference
                object {variable ['object']}
                name ['field']
            }
        
        spec 'self field reference'
            (expression ':field') should contain fields {
                is field reference
                object {variable ['self']}
                name ['field']
            }
        
        spec 'indexer'
            (expression 'object: @x') should contain fields {
                is indexer
                object {variable ['object']}
                indexer {variable ['x']}
            }

    spec 'blocks'
        spec 'empty block'
            (expression '@{}') should contain fields {
                is block
                parameters []
                redefines self @false
                body {statements []}
            }
                
        spec 'block'
            (expression '@{x.y}') should contain fields {
                is block
                parameters []
                redefines self @false
                body {statements [
                    {variable ['x']}
                    {variable ['y']}
                ]}
            }

        spec 'block with parameter'
            (expression "#x\n  x.y") should contain fields {
                is block
                parameters [{is parameter, expression {variable ['x']}}]
                redefines self @false
                body {
                    statements [
                        {variable ['x']}
                        {variable ['y']}
                    ]
                }
            }

        spec 'block with parameter, redefining self'
            (expression '#x => @{x.y}') should contain fields {
                is block
                parameters [{is parameter, expression {variable ['x']}}]
                redefines self @true
                body {
                    statements [
                        {variable ['x']}
                        {variable ['y']}
                    ]
                }
            }

    spec 'operators'
        spec 'should be lower precedence than object operation'
            (expression 'o:m 2 +- o:x') should contain fields {
                is method call
                object {
                    is method call
                    object {variable ['o']}
                    name ['m']
                    arguments [{integer 2}]
                }
                    
                name ['+-']
                arguments [
                    {
                        is field reference
                        object {variable ['o']}
                        name ['x']
                    }
                ]
            }
                
        spec 'parses backslash'
            (expression "2 +\\+ 1") should contain fields {
                is method call
                object {integer 2}
                    
                name ["+\\+"]
                arguments [
                    {integer 1}
                ]
            }
                
        spec 'unary operators should be higher precedence than binary operators'
            (expression 'a && ! b') should contain fields {
                is operator
                operator '&&'
                
                arguments [
                    {variable ['a']}
                    {
                        is operator
                        operator '!'
                        arguments [{variable ['b']}]
                    }
                ]
            }
                
        spec 'can have newlines immediately after operator'
            (expression "a &&\nb") should contain fields {
                is operator
                operator '&&'
                
                arguments [
                    {variable ['a']}
                    {variable ['b']}
                ]
            }
      
    spec 'assignment'
        spec 'assignment'
            (expression 'x = y') should contain fields {
                is definition
                target {variable ['x']}
                source {variable ['y']}
            }

        spec 'function definition'
            spec 'function with one parameter'
                (expression 'func @x = x') should contain fields {
                    is definition
                    target {variable ['func']}
                    source {
                        parameters [{is parameter, expression {variable ['x']}}]
                        body {statements [{variable ['x']}]}
                    }
                }

            spec 'function with one parameter, and one optional parameter'
                (expression 'func @x, port 80 = x') should contain fields {
                    is definition
                    target {variable ['func']}
                    source {
                        parameters [{is parameter, expression {variable ['x']}}]
                        optional parameters [{field ['port'], value {integer 80}}]
                        body {statements [{variable ['x']}]}
                    }
                }

        spec 'field assignment'
            (expression 'o: x = y') should contain fields {
                is definition
                target {
                    is field reference
                    object {variable ['o']}
                    name ['x']
                }

                source {variable ['y']}
            }

        spec 'index assignment'
            (expression 'o: @x = y') should contain fields {
                is definition
                target {
                    is indexer
                    object {variable ['o']}
                    indexer {variable ['x']}
                }

                source {variable ['y']}
            }

        spec 'assignment from field'
            (expression 'x = y: z') should contain fields {
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

        spec 'assignment of command'
            (expression 'x! = 8') should contain fields {
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

        spec 'assignment of query'
            (expression 'x? = 8') should contain fields {
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

        spec 'assignment from method call'
            (expression 'x = y: z @a') should contain fields {
                is definition
                target {variable ['x']}
                source {
                    is method call
                    object {
                        variable ['y']
                    }

                    name ['z']
                    arguments [{variable ['a']}]
                }
            }

        spec 'field assignment from method call'
            (expression 'i: x = y: z @a') should contain fields {
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
                    arguments [{variable ['a']}]
                }
            }
