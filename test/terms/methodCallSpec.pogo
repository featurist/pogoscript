terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'

describe 'method call'
    it 'generates splat arguments'
        method call =
            terms.method call (
                terms.variable ['object']
                ['method']
                [
                    terms.variable ['args']
                    terms.splat ()
                ]
            )

        expanded method call = method call.expand macros ()

        (expanded method call) should contain fields (
            terms.sub statements [
                terms.definition (terms.generated variable ['o'], terms.variable ['object'])
                terms.method call (
                    terms.field reference (terms.generated variable ['o'], ['method'])
                    ['apply']
                    [
                        terms.generated variable ['o']
                        terms.variable ['args']
                    ]
                )
            ]
        )

    it 'generates splat arguments, passing optional argument as last'
        method call =
            terms.method call (
                terms.variable ['object']
                ['method']
                [
                    terms.variable ['args']
                    terms.splat ()
                ]
                optional arguments: [
                    terms.hash entry (['port'], terms.variable ['p'])
                ]
            )

        expanded method call = method call.expand macros ()

        (expanded method call) should contain fields (
            terms.sub statements [
                terms.definition (terms.generated variable ['o'], terms.variable ['object'])
                terms.method call (
                    terms.field reference (terms.generated variable ['o'], ['method'])
                    ['apply']
                    [
                        terms.generated variable ['o']
                        terms.method call (
                            terms.variable ['args']
                            ['concat']
                            [terms.list [terms.hash [terms.hash entry (['port'], terms.variable ['p'])]]]
                        )
                    ]
                )
            ]
        )

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
