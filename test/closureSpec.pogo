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
