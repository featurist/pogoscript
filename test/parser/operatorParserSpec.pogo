require '../assertions'
require '../parserAssertions'
terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
_ = require 'underscore'

describe 'operator expression'
    variable (name) = terms.complex expression [[terms.variable [name]]]

    it 'parses operators, using precedence table'
        (expression "a @and b") should contain fields (
            terms.operator (
                '&&'
                [
                    terms.variable ['a']
                    terms.variable ['b']
                ]
            )
        )

    compilation map = {}

    (name) compiles to (js op name) =
        compilation map.(name) = js op name

    compiled name for (name) =
        if (Object.has own property.call (compilation map, name))
            compilation map.(name)
        else
            name

    '@and' compiles to '&&'
    '@or' compiles to '||'
    '==' compiles to '==='
    '!=' compiles to '!=='
    '@not' compiles to '!'

    (higher) is higher in precedence than (lower) =
        it "parses #(higher) as higher precedence than #(lower)"
            (expression "a #(higher) b #(lower) c") should contain fields (
                terms.operator (
                    compiled name for (lower)
                    [
                        terms.operator (
                            compiled name for (higher)
                            [
                                terms.variable ['a']
                                terms.variable ['b']
                            ]
                        )
                        terms.variable ['c']
                    ]
                )
            )

        it "parses #(lower) as lower precedence than #(higher)"
            (expression "a #(lower) b #(higher) c") should contain fields (
                terms.operator (
                    compiled name for (lower)
                    [
                        terms.variable ['a']
                        terms.operator (
                            compiled name for (higher)
                            [
                                terms.variable ['b']
                                terms.variable ['c']
                            ]
                        )
                    ]
                )
            )

    it 'throws when a custom operator is used before other operators'
        op = terms.operator expression (variable 'a')
        op.add operator '@custom' expression (variable 'b')
        op.add operator '@and' expression (variable 'c')

        @{op.expression ()}.should.throw '@custom cannot be used with other operators'

    it 'throws when a custom operator is used after other operators'
        op = terms.operator expression (variable 'a')
        op.add operator '@and' expression (variable 'b')
        op.add operator '@custom' expression (variable 'c')

        @{op.expression ()}.should.throw '@custom cannot be used with other operators'

    operators in order of precedence = [
        ['/', '*', '%']
        ['-', '+']
        ['<<', '>>', '>>>']
        ['>', '>=', '<', '<=']
        ['==', '!=']
        '&'
        '^'
        '|'
        ['&&', '@and']
        ['||', '@or']
    ]

    the left operator (left) has higher precedence than the right operator (right) =
        (expression "a #(left) b #(right) c") should contain fields (
            terms.operator (
                compiled name for (right)
                [
                    terms.operator (
                        compiled name for (left)
                        [
                            terms.variable ['a']
                            terms.variable ['b']
                        ]
                    )
                    terms.variable ['c']
                ]
            )
        )
        
    (operators) are the same precedence and are left associative =
        _.reduce (operators) @(left, right)
            it "parses #(left) with the same precedence as #(right) and both are left associative"
                the left operator (left) has higher precedence than the right operator (right)
                the left operator (right) has higher precedence than the right operator (left)

            right

    _.reduce (operators in order of precedence) @(higher, lower)
        if (higher :: Array)
            (higher) are the same precedence and are left associative

            if (lower :: Array)
                (higher.0) is higher in precedence than (lower.0)
            else
                (higher.0) is higher in precedence than (lower)
        else
            if (lower :: Array)
                (higher) is higher in precedence than (lower.0)
            else
                (higher) is higher in precedence than (lower)

        lower

    it parses unary operator (op) =
        it "should parse unary #(op)"
            (expression "#(op) a") should contain fields {
                operator = compiled name for (op)
                operator arguments = [
                    {variable ['a'], is variable}
                ]
            }

    it "parses two unary operators"
        (expression "@outer @inner a") should contain fields (
            terms.function call (
                terms.variable ['outer']
                [
                    terms.function call (
                        terms.variable ['inner']
                        [
                            terms.variable ['a']
                        ]
                    )
                ]
            )
        )

    it "parses @custom unary operator as function call"
        (expression "@custom a") should contain fields (
            terms.function call (terms.variable ['custom'], [terms.variable ['a']])
        )

    unary operators = [
        '!'
        '@not'
        '~'
        '+'
        '-'
    ]

    for each @(op) in (unary operators)
        it parses unary operator (op)
