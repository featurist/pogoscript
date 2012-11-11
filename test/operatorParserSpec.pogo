require './assertions'
require './parserAssertions'

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
