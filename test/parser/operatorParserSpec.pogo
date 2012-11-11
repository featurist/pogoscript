require '../assertions'
terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
operator expression = (require '../../lib/parser/operatorExpression') (terms)
_ = require 'underscore'

describe 'operator parser'
    variable (name) = terms.complex expression [[terms.variable [name]]]

    it 'parses operators, using precedence table'
        op = operator expression (variable 'a')
        op.add operator ('@and') expression (variable 'b')

        (op.expression ()) should contain fields (
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

    (higher) is higher in precedence than (lower) =
        it "parses #(higher) as higher precedence than #(lower)"
            op = operator expression (variable 'a')
            op.add operator (higher) expression (variable 'b')
            op.add operator (lower) expression (variable 'c')

            (op.expression ()) should contain fields (
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
            op = operator expression (variable 'a')
            op.add operator (lower) expression (variable 'b')
            op.add operator (higher) expression (variable 'c')

            (op.expression ()) should contain fields (
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
        op = operator expression (variable 'a')
        op.add operator '@custom' expression (variable 'b')
        op.add operator '@and' expression (variable 'c')

        @{op.expression ()}.should.throw '@custom cannot be used with other operators'

    it 'throws when a custom operator is used after other operators'
        op = operator expression (variable 'a')
        op.add operator '@and' expression (variable 'b')
        op.add operator '@custom' expression (variable 'c')

        @{op.expression ()}.should.throw '@custom cannot be used with other operators'

    operators in order of precedence = [
        '/'
        '*'
        '%'
        '-'
        '+'
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

    _.reduce (operators in order of precedence) @(higher, lower)
        (higher) is higher in precedence than (lower)
        lower
