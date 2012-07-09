terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should contain fields = require './containsFields'.contains fields

describe 'statements'
    describe 'they can be rewritten for callback style'
        it 'an async function statement is rewritten, accepting zero remaining statements as a block'
            statements = terms.statements [terms.function call (terms.variable ['fn'], [], nil, async: true)]

            callback statements = statements.expand macros ().rewrite async callbacks ()

            expected statements = terms.statements [
                terms.function call (terms.variable ['fn'], [
                    terms.closure (
                        [terms.generated variable ['error'], terms.generated variable ['async', 'result']]
                        terms.statements [
                            terms.return statement (terms.generated variable ['async', 'result'])
                        ]
                    )
                ])
            ]

            (callback statements) should contain fields (expected statements)

        it 'an async function as a result of another function is rewritten to pass the result to a callback'
            statements = terms.statements [
                terms.function call (terms.variable ['b'], [
                    terms.function call (terms.variable ['a'], [], nil, async: true)
                ])
            ]

            callback statements = statements.expand macros ().rewrite async callbacks ()

            expected statements = terms.statements [
                terms.function call (terms.variable ['a'], [
                    terms.closure (
                        [terms.generated variable ['error'], terms.generated variable ['async', 'result']]
                        terms.statements [
                            terms.return statement (terms.function call (terms.variable ['b'], [terms.generated variable ['async', 'result']]))
                        ]
                    )
                ])
            ]

            (callback statements) should contain fields (expected statements)

        it 'returns last statement'
            statements = terms.statements [
                terms.variable ['one']
                terms.variable ['two']
                terms.variable ['three']
            ]

            callback statements = statements.expand macros ().rewrite async callbacks ()

            expected statements = terms.statements [
                terms.variable ['one']
                terms.variable ['two']
                terms.return statement (terms.variable ['three'])
            ]

            (callback statements) should contain fields (expected statements)
