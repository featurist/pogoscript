terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should contain fields = require './containsFields'.contains fields

describe 'async statements'
    describe 'serialising sub statements'
        it 'serialises sub statements'
            statements = terms.async statements [
                terms.sub statements [
                    terms.variable ['a']
                    terms.variable ['b']
                ]
            ]

            (statements) should contain fields (terms.statements [
                terms.variable ['a']
                terms.variable ['b']
            ])

        it 'serialises sub statements inside sub statements'
            statements = terms.async statements [
                terms.sub statements [
                    terms.sub statements [
                        terms.variable ['a']
                        terms.variable ['b']
                    ]
                    terms.variable ['c']
                ]
            ]

            (statements) should contain fields (terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ])

        it 'serialises sub statements inside sub statements, even if they are the last statement'
            statements = terms.async statements [
                terms.sub statements [
                    terms.variable ['a']
                    terms.sub statements [
                        terms.variable ['b']
                        terms.variable ['c']
                    ]
                ]
            ]

            (statements) should contain fields (terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ])

        it "doesn't serialise sub statements in inner blocks"
            statements = terms.async statements [
                terms.statements [
                    terms.sub statements [
                        terms.variable ['a']
                        terms.variable ['b']
                    ]
                ]
            ]

            (statements) should contain fields (terms.statements [
                terms.statements [
                    terms.sub statements [
                        terms.variable ['a']
                        terms.variable ['b']
                    ]
                ]
            ])

    describe 'rewriting async calls into calls with callbacks'
        describe 'when there are no async calls'
            it "doesn't do anything"
                statements = terms.async statements [
                    terms.variable ['a']
                    terms.variable ['b']
                ]

                (statements) should contain fields (terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                ])

        describe 'when there is one async call, with no statements after it'
            it 'passes the outer callback function as the last argument'
                statements = terms.async statements [
                    terms.function call (terms.variable ['async', 'func'], [terms.variable ['arg']], async: true)
                ]

                (statements) should contain fields (
                    terms.statements (
                        [
                            terms.function call (
                                terms.variable ['async', 'func']
                                [terms.variable ['arg']]
                                originally async: true
                                async callback argument: terms.callback function
                            )
                        ]
                        async: true
                    )
                )

        describe 'when there are statements after the async call'
            it 'puts them into a callback and passes the callback as the last argument'
                statements = terms.async statements [
                    terms.function call (terms.variable ['async', 'func'], [terms.variable ['arg']], async: true)
                    terms.function call (terms.variable ['another', 'func'], [])
                ]

                (statements) should contain fields (
                    terms.statements (
                        [
                            terms.function call (
                                terms.variable ['async', 'func']
                                [
                                    terms.variable ['arg']
                                ]
                                originally async: true
                                async callback argument:
                                    terms.async callback (
                                        terms.statements [
                                            terms.async result ()
                                            terms.function call (terms.variable ['another', 'func'], [])
                                        ]
                                        result variable: terms.async result ()
                                    )
                            )
                        ]
                        async: true
                    )
                )
