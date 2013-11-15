terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'

describe 'method call'
    it 'returns self when no splat arguments'
        method call =
            terms.method call (
                terms.variable ['object']
                ['method']
                [
                    terms.variable ['args']
                ]
            )

        expanded method call = method call.expand macros ()

        (expanded method call) should contain fields (
            terms.method call (
                terms.variable ['object']
                ['method']
                [
                    terms.variable ['args']
                ]
            )
        )

    context 'when the method call is asynchronous'
        context 'and a non-asynchronous block is passed'
            it 'asyncifies the block'
                method call =
                    terms.method call (
                        terms.variable ['obj']
                        ['method']
                        [
                            terms.closure (
                                []
                                terms.statements [
                                    terms.variable ['a']
                                ]
                            )
                        ]
                        async: true
                    )

                block arg =
                    terms.closure (
                        []
                        terms.statements [
                            terms.variable ['a']
                        ]
                    )

                block arg.asyncify ()

                expected method call =
                    terms.method call (
                        terms.variable ['obj']
                        ['method']
                        [
                            block arg
                        ]
                        async: true
                    )

                (method call) should contain fields (expected method call)

        context 'and a non-asynchronous block is passed as an optional argument'
            it 'asyncifies the block'
                method call =
                    terms.method call (
                        terms.variable ['obj']
                        ['method']
                        []
                        optional arguments: [
                            terms.hash entry (
                                ['block']
                                terms.closure (
                                    []
                                    terms.statements [
                                        terms.variable ['a']
                                    ]
                                )
                            )
                        ]
                        async: true
                    )

                block arg =
                    terms.closure (
                        []
                        terms.statements [
                            terms.variable ['a']
                        ]
                    )

                block arg.asyncify ()

                expected method call =
                    terms.method call (
                        terms.variable ['obj']
                        ['method']
                        []
                        optional arguments: [
                            terms.hash entry (
                                ['block']
                                block arg
                            )
                        ]
                        async: true
                    )

                (method call) should contain fields (expected method call)

    context 'when a method call is a future'
        it 'returns a call to future, making the method call asynchronous and passing it as a closure to future'
            future method call = terms.method call (terms.variable ['object'], ['method'], [terms.variable ['arg']], future: true)

            (future method call) should contain fields (
                terms.function call (
                    terms.generated variable ['future']
                    [
                        terms.closure (
                            [terms.callback function]
                            terms.statements [
                                terms.method call (
                                    terms.variable ['object']
                                    ['method']
                                    [terms.variable ['arg']]
                                    originally async: true
                                    async callback argument: terms.callback function
                                )
                            ]
                        )
                    ]
                )
            )
