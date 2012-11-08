require './assertions'

parser = require '../src/bootstrap/parser'
require './parserAssertions'
create terms () = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()

describe 'operators'
    it parses binary operator (op) =
        it "should parse binary #(op)"
            (expression "a #(op) b") should contain fields {
                operator = op
                operator arguments = [
                    {variable ['a'], is variable}
                    {variable ['b'], is variable}
                ]
            }

    it parses unary operator (op) =
        it "should parse unary #(op)"
            (expression "#(op) a") should contain fields {
                operator = op
                operator arguments = [
                    {variable ['a'], is variable}
                ]
            }

    it parses (higher) as higher precedence than (lower) =
        it "it parses #(higher) as higher precedence than #(lower)"
            (expression "a #(higher) b #(lower) c") should contain fields {
                operator = op
                operator arguments = [
                    {
                        operator = higher
                        operator arguments = [
                            {variable ['a'], is variable}
                            {variable ['b'], is variable}
                        ]
                    }
                    {variable ['c'], is variable}
                ]
            }
        
    binary operators = [
        '+'
        '*'
        '/'
        '-'
        '%'
        '<<'
        '>>'
        '>>>'
        '>'
        '>='
        '<'
        '<='
        '&'
        '^'
        '|'
        '&&'
        '||'
    ]

    unary operators = [
        '!'
        '~'
        '+'
        '-'
    ]

    for each @(op) in (unary operators)
        it parses unary operator (op)

    for each @(op) in (binary operators)
        it parses binary operator (op)

    it parses '*' as higher precedence than '+'
