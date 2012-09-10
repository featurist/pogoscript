terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should contain fields = require './containsFields'.contains fields

describe 'closure'
    describe 'async closure'
        it 'calls callback for return value'
            closure = terms.closure ([], terms.statements [terms.variable ['a']], async: true)

            rewritten closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.function call (terms.generated variable ['callback'], [terms.nil (), terms.variable ['a']])
                ]
                async: true
            )

            (rewritten closure) should contain fields (expected closure)

        it 'an async function statement is rewritten, accepting zero remaining statements as a block'
            closure = terms.closure (
                []
                terms.statements [
                    terms.function call (terms.variable ['fn'], [], nil, async: true)
                ]
                async: true
            )

            callback closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.function call (
                        terms.variable ['fn']
                        [
                            terms.closure (
                                [terms.generated variable ['error'], terms.generated variable ['async', 'result']]
                                terms.statements [
                                    terms.if expression (
                                        [
                                            [
                                                terms.generated variable ['error']
                                                terms.statements [
                                                    terms.function call (terms.generated variable ['callback'], [terms.generated variable ['error']])
                                                ]
                                            ]
                                        ]
                                        terms.statements [
                                            terms.try expression (
                                                terms.statements [
                                                    terms.function call (terms.generated variable ['callback'], [terms.nil (), terms.generated variable ['async', 'result']])
                                                ]
                                                catch parameter: terms.generated variable ['error']
                                                catch body: terms.statements [
                                                    terms.function call (
                                                        terms.generated variable ['callback']
                                                        [terms.generated variable ['error']]
                                                    )
                                                ]
                                            )
                                        ]
                                    )
                                ]
                            )
                        ]
                        nil
                        async: true
                    )
                ]
                async: true
            )

            (callback closure) should contain fields (expected closure)

        it 'an async function as a result of another function is rewritten to pass the result to a callback'
            closure = terms.closure (
                []
                terms.statements [
                    terms.function call (terms.variable ['b'], [
                        terms.function call (terms.variable ['a'], [], nil, async: true)
                    ])
                ]
                async: true
            )

            callback closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.function call (
                        terms.variable ['a']
                        [
                            terms.closure (
                                [terms.generated variable ['error'], terms.generated variable ['async', 'result']]
                                terms.statements [
                                    terms.if expression (
                                        [
                                            [
                                                terms.generated variable ['error']
                                                terms.statements [
                                                    terms.function call (terms.generated variable ['callback'], [terms.generated variable ['error']])
                                                ]
                                            ]
                                        ]
                                        terms.statements [
                                            terms.try expression (
                                                terms.statements [
                                                    terms.function call (terms.generated variable ['callback'], [terms.nil (), terms.function call (terms.variable ['b'], [terms.generated variable ['async', 'result']])])
                                                ]
                                                catch parameter: terms.generated variable ['error']
                                                catch body: terms.statements [
                                                    terms.function call (
                                                        terms.generated variable ['callback']
                                                        [terms.generated variable ['error']]
                                                    )
                                                ]
                                            )
                                        ]
                                    )
                                ]
                            )
                        ]
                        nil
                        async: true
                    )
                ]
                async: true
            )

            (callback closure) should contain fields (expected closure)

    describe 'returning last statement'
        it 'returns simple expressions'
            closure = terms.closure ([], terms.statements [terms.variable ['a']])

            rewritten closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.return statement (terms.variable ['a'], implicit: true)
                ]
            )

            (rewritten closure) should contain fields (expected closure)

        it 'if expressions return themselves'
            closure = terms.closure ([], terms.statements [
                terms.if expression (
                    [
                        [
                            terms.variable ['condition']
                            terms.statements [terms.variable ['true']]
                        ]
                    ]
                    terms.statements [terms.variable ['false']]
                )
            ])

            rewritten closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.if expression (
                        [
                            [
                                terms.variable ['condition']
                                terms.statements [
                                    terms.return statement (terms.variable ['true'], implicit: true)
                                ]
                            ]
                        ]
                        terms.statements [
                            terms.return statement (terms.variable ['false'], implicit: true)
                        ]
                    )
                ]
            )

            (rewritten closure) should contain fields (expected closure)

        it "doesn't return last statement if closure is told not to"
            closure = terms.closure ([], terms.statements [terms.variable ['a']], return last statement: false)

            rewritten closure = closure.rewrite ()

            expected closure = terms.closure (
                []
                terms.statements [
                    terms.variable ['a']
                ]
                return last statement: false
            )

            (rewritten closure) should contain fields (expected closure)
