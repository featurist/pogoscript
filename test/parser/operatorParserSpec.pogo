require '../assertions'
require '../parserAssertions'
terms = require '../../lib/parser/codeGenerator'.codeGenerator ()
_ = require 'underscore'

describe 'operator expression'
    variable (name) = terms.complexExpression [[terms.variable [name]]]

    it 'parses operators, using precedence table'
        (expression "a @and b") shouldContainFields (
            terms.operator (
                '&&'
                [
                    terms.variable ['a']
                    terms.variable ['b']
                ]
            )
        )

    compilationMap = {}

    (name) compilesTo (jsOpName) =
        compilationMap.(name) = jsOpName

    compiledNameFor (name) =
        if (Object.hasOwnProperty.call (compilationMap, name))
            compilationMap.(name)
        else
            name

    '@and' compilesTo '&&'
    '@or' compilesTo '||'
    '==' compilesTo '==='
    '!=' compilesTo '!=='
    '@not' compilesTo '!'
    '^^' compilesTo '^'

    (higher) isHigherInPrecedenceThan (lower) =
        it "parses #(higher) as higher precedence than #(lower)"
            (expression "a #(higher) b #(lower) c") shouldContainFields (
                terms.operator (
                    compiledNameFor (lower)
                    [
                        terms.operator (
                            compiledNameFor (higher)
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
            (expression "a #(lower) b #(higher) c") shouldContainFields (
                terms.operator (
                    compiledNameFor (lower)
                    [
                        terms.variable ['a']
                        terms.operator (
                            compiledNameFor (higher)
                            [
                                terms.variable ['b']
                                terms.variable ['c']
                            ]
                        )
                    ]
                )
            )

    describe 'custom operators'
        it 'throws when a custom operator is used before other operators'
            operator = terms.operatorExpression (variable 'a')
            operator.addOperator '@custom' expression (variable 'b')
            operator.addOperator '@and' expression (variable 'c')

            @{operator.expression ()}.should.throw '@custom cannot be used with other operators'

        it 'throws when a custom operator is used after other operators'
            operator = terms.operatorExpression (variable 'a')
            operator.addOperator '@and' expression (variable 'b')
            operator.addOperator '@custom' expression (variable 'c')

            @{operator.expression ()}.should.throw '@custom cannot be used with other operators'

        it "parses two custom unary operators, outer to inner"
            (expression "@outer @inner a") shouldContainFields (
                terms.functionCall (
                    terms.variable ['outer']
                    [
                        terms.functionCall (
                            terms.variable ['inner']
                            [
                                terms.variable ['a']
                            ]
                        )
                    ]
                )
            )

        it "parses @custom binary operator as function call"
            (expression "a @custom b") shouldContainFields (
                terms.functionCall (terms.variable ['custom'], [terms.variable ['a'], terms.variable ['b']])
            )

        it "parses @你好 binary operator as function call"
            (expression "a @你好 b") shouldContainFields (
                terms.functionCall (terms.variable ['你好'], [terms.variable ['a'], terms.variable ['b']])
            )

        it "parses @custom unary operator as function call"
            (expression "@custom a") shouldContainFields (
                terms.functionCall (terms.variable ['custom'], [terms.variable ['a']])
            )

        it "parses @你好 unary operator as function call"
            (expression "@你好 a") shouldContainFields (
                terms.functionCall (terms.variable ['你好'], [terms.variable ['a']])
            )

        it "parses camel case custom operators"
            (expression "@customOp a") shouldContainFields (
                terms.functionCall (terms.variable ['customOp'], [terms.variable ['a']])
            )

    operatorsInOrderOfPrecedence = [
        ['/', '*', '%']
        ['-', '+']
        ['<<', '>>', '>>>']
        ['>', '>=', '<', '<=']
        ['==', '!=']
        '&'
        '^^'
        '|'
        ['&&', '@and']
        ['||', '@or']
        ['<-']
    ]

    theLeftOperator (left) hasHigherPrecedenceThanTheRightOperator (right) =
        (expression "a #(left) b #(right) c") shouldContainFields (
            terms.operator (
                compiledNameFor (right)
                [
                    terms.operator (
                        compiledNameFor (left)
                        [
                            terms.variable ['a']
                            terms.variable ['b']
                        ]
                    )
                    terms.variable ['c']
                ]
            )
        )
        
    (operators) areTheSamePrecedenceAndAreLeftAssociative =
        _.reduce (operators) @(left, right)
            it "parses #(left) with the same precedence as #(right) and both are left associative"
                theLeftOperator (left) hasHigherPrecedenceThanTheRightOperator (right)
                theLeftOperator (right) hasHigherPrecedenceThanTheRightOperator (left)

            right

    _.reduce (operatorsInOrderOfPrecedence) @(higher, lower)
        if (higher :: Array)
            (higher) areTheSamePrecedenceAndAreLeftAssociative

            if (lower :: Array)
                (higher.0) isHigherInPrecedenceThan (lower.0)
            else
                (higher.0) isHigherInPrecedenceThan (lower)
        else
            if (lower :: Array)
                (higher) isHigherInPrecedenceThan (lower.0)
            else
                (higher) isHigherInPrecedenceThan (lower)

        lower

    itParsesUnaryOperator (op) =
        it "should parse unary #(op)"
            (expression "#(op) a") shouldContainFields {
                operator = compiledNameFor (op)
                operatorArguments = [
                    {variable ['a'], isVariable}
                ]
            }

    unaryOperators = [
        '!'
        '@not'
        '~'
        '+'
        '-'
    ]

    for each @(op) in (unaryOperators)
        itParsesUnaryOperator (op)
