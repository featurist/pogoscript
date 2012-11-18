terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'if expression term'
    describe 'returning as last statement'
        it 'returns last statement from then and else bodies'
            expression =
                terms.if expression (
                    [
                        {
                            condition = terms.variable ['condition', 'a']
                            body = terms.statements [
                                terms.variable ['a']
                                terms.variable ['b']
                            ]
                        }
                        {
                            condition = terms.variable ['condition', 'b']
                            body = terms.statements [
                                terms.variable ['c']
                                terms.variable ['d']
                            ]
                        }
                    ]
                    terms.statements [
                        terms.variable ['e']
                        terms.variable ['f']
                    ]
                )

            expected if expression = 
                terms.if expression (
                    [
                        {
                            condition = terms.variable ['condition', 'a']
                            body = terms.statements [
                                terms.variable ['a']
                                terms.return statement (terms.variable ['b'], implicit: true)
                            ]
                        }
                        {
                            condition = terms.variable ['condition', 'b']
                            body = terms.statements [
                                terms.variable ['c']
                                terms.return statement (terms.variable ['d'], implicit: true)
                            ]
                        }
                    ]
                    terms.statements [
                        terms.variable ['e']
                        terms.return statement (terms.variable ['f'], implicit: true)
                    ]
                )

            expression.rewrite result term @(term) into
                terms.return statement (term, implicit: true)

            (expression) should contain fields (expected if expression)

    describe 'asynchronous if'
        context 'when no else and only one case'
            it 'calls an async if function, with body in a closure'
                if expression = terms.if expression [
                    {
                        condition = terms.variable ['condition']
                        body = terms.statements (
                            [
                                terms.variable ['async']
                            ]
                            async: true
                        )
                    }
                ]

                expected async if expression = terms.function call (
                    terms.generated variable ['async', 'if']
                    [
                        terms.variable ['condition']
                        terms.closure (
                            []
                            terms.statements ([terms.variable ['async']], async: true)
                        )
                    ]
                    async: true
                )

                (if expression) should contain fields (expected async if expression)

        context 'when there is an else and only one case'
            it 'calls an async if else function, with body and else body in a closure'
                if expression = terms.if expression(
                    [
                        {
                            condition = terms.variable ['condition']
                            body = terms.statements (
                                [
                                    terms.variable ['body']
                                ]
                            )
                        }
                    ]
                    terms.statements (
                        [
                            terms.variable ['else', 'body']
                        ]
                        async: true
                    )
                )

                body = 
                    terms.closure (
                        []
                        terms.statements [terms.variable ['body']]
                    )

                body.asyncify ()

                expected async if expression = terms.function call (
                    terms.generated variable ['async', 'if', 'else']
                    [
                        terms.variable ['condition']
                        body
                        terms.closure (
                            []
                            terms.statements ([terms.variable ['else', 'body']], async: true)
                        )
                    ]
                    async: true
                )

                (if expression) should contain fields (expected async if expression)

    describe 'code generation'
        if expression = nil

        before each
            if expression := terms.if expression (
                [
                    {
                        condition = terms.variable ['condition']
                        body = terms.statements [
                            terms.variable ['body']
                        ]
                    }
                ]
                terms.statements [
                    terms.variable ['else', 'body']
                ]
            )

        context 'as a statement'
            it 'generates a regular js if statement'
                (if expression) should generate statement 'if(condition){body;}else{elseBody;}'

        context 'as an expression'
            it 'generates a scoped if statement, returning the last statement of each body'
                (if expression) should generate expression '(function(){if(condition){return body;}else{return elseBody;}})()'
