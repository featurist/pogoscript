terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should contain fields = require './containsFields'.contains fields

describe 'closure'
    describe 'asyncify'
        context 'when the body is not asynchronous'
            it 'makes sure that the result is passed to a callback'
                closure = terms.closure (
                    []
                    terms.statements [
                        terms.variable ['asdf']
                    ]
                )

                closure.asyncify ()

                (closure) should contain fields (
                    terms.closure (
                        []
                        terms.statements (
                            [
                                terms.function call (terms.callback function, [terms.nil (), terms.variable ['asdf']])
                            ]
                            async: true
                        )
                        async: true
                    )
                )

        context 'when the body is asynchronous'
            it 'does nothing'
                closure = terms.closure (
                    []
                    terms.statements (
                        [
                            terms.variable ['asdf']
                        ]
                        async: true
                    )
                )

                closure.asyncify ()

                (closure) should contain fields (
                    terms.closure (
                        []
                        terms.statements (
                            [
                                terms.variable ['asdf']
                            ]
                            async: true
                        )
                        async: true
                    )
                )

    describe 'parameter strategy selection'
        strats = terms.closure parameter strategies
        statements = nil

        before
            statements = terms.statements [
                terms.variable ['a']
            ]

        context 'when there are only normal parameters'
            it 'selects the normal strategy'
                closure = terms.closure (
                    [terms.variable ['a']]
                    statements
                )

                (closure.parameters strategy ()) should contain fields (
                    strats.function strategy (
                        strats.normal strategy [
                            terms.variable ['a']
                        ]
                    )
                )

        describe 'splat parameters'
            context 'when there is a splat parameter and no others'
                it 'selects the splat strategy'
                    closure = terms.closure (
                        [terms.variable ['a'], terms.splat ()]
                        statements
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.splat strategy (
                                before: []
                                splat: terms.variable ['a']
                                after: []
                            )
                        )
                    )

            context 'when there is a parameter, then a splat parameter and no others'
                it 'selects the splat strategy'
                    closure = terms.closure (
                        [terms.variable ['a'], terms.variable ['b'], terms.splat ()]
                        statements
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.splat strategy (
                                before: [terms.variable ['a']]
                                splat: terms.variable ['b']
                                after: []
                            )
                        )
                    )

            context 'when there is a splat parameter and then a normal parameter'
                it 'selects the splat strategy'
                    closure = terms.closure (
                        [terms.variable ['a'], terms.splat (), terms.variable ['b']]
                        statements
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.splat strategy (
                                before: []
                                splat: terms.variable ['a']
                                after: [terms.variable ['b']]
                            )
                        )
                    )

            context 'when there is a normal parameter, then a splat parameter and then a normal parameter'
                it 'selects the splat strategy'
                    closure = terms.closure (
                        [terms.variable ['a'], terms.variable ['b'], terms.splat (), terms.variable ['c']]
                        statements
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.splat strategy (
                                before: [terms.variable ['a']]
                                splat: terms.variable ['b']
                                after: [terms.variable ['c']]
                            )
                        )
                    )

        describe 'optional parameters'
            context 'when there are only optional parameters'
                it 'uses the optional strategy'
                    closure = terms.closure (
                        []
                        statements
                        optional parameters: [
                            terms.hash entry ['a'] (terms.integer 90)
                            terms.hash entry ['b'] (terms.string 'hi')
                        ]
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.optional strategy (
                                before: []
                                options: [
                                    terms.hash entry ['a'] (terms.integer 90)
                                    terms.hash entry ['b'] (terms.string 'hi')
                                ]
                            )
                        )
                    )

            context 'when there is one normal parameter and two optional parameters'
                it 'uses the optional strategy'
                    closure = terms.closure (
                        [terms.variable ['x']]
                        statements
                        optional parameters: [
                            terms.hash entry ['a'] (terms.integer 90)
                            terms.hash entry ['b'] (terms.string 'hi')
                        ]
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.optional strategy (
                                before: [terms.variable ['x']]
                                options: [
                                    terms.hash entry ['a'] (terms.integer 90)
                                    terms.hash entry ['b'] (terms.string 'hi')
                                ]
                            )
                        )
                    )

        describe 'functions that take an async callback parameter'
            context 'when there are just normal parameters'
                it 'chooses the callback strategy containing a normal strategy'
                    closure = terms.closure (
                        [terms.variable ['a']]
                        statements
                        async: true
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.callback strategy (
                                strats.normal strategy [
                                    terms.variable ['a']
                                ]
                            )
                        )
                    )

            context 'when there is one normal parameter and two optional parameters'
                it 'uses the optional strategy'
                    closure = terms.closure (
                        [terms.variable ['x']]
                        statements
                        optional parameters: [
                            terms.hash entry ['a'] (terms.integer 90)
                            terms.hash entry ['b'] (terms.string 'hi')
                        ]
                        async: true
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.callback strategy (
                                strats.optional strategy (
                                    before: [terms.variable ['x']]
                                    options: [
                                        terms.hash entry ['a'] (terms.integer 90)
                                        terms.hash entry ['b'] (terms.string 'hi')
                                    ]
                                )
                            )
                        )
                    )

            context 'when there is a normal parameter, then a splat parameter and then a normal parameter'
                it 'selects the splat strategy'
                    closure = terms.closure (
                        [terms.variable ['a'], terms.variable ['b'], terms.splat (), terms.variable ['c']]
                        statements
                        async: true
                    )

                    (closure.parameters strategy ()) should contain fields (
                        strats.function strategy (
                            strats.callback strategy (
                                strats.splat strategy (
                                    before: [terms.variable ['a']]
                                    splat: terms.variable ['b']
                                    after: [terms.variable ['c']]
                                )
                            )
                        )
                    )
