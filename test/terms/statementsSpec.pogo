terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'statements term'
    describe 'code generation'
        it 'generates global variables'
            statements = terms.statements (
                [
                    terms.definition (terms.variable ['a'], terms.integer 1)
                    terms.definition (terms.variable ['b'], terms.integer 1)
                ]
                global: true
            )

            (statements) should generate statements 'a=1;b=1;'

        it 'generates local variables'
            statements = terms.statements [
                terms.definition (terms.variable ['a'], terms.integer 1)
                terms.definition (terms.variable ['b'], terms.integer 1)
            ]

            (statements) should generate statements 'var a,b;a=1;b=1;'

    describe 'returning last statement'
        context 'when async'
            it 'calls a callback function'
                statements = terms.statements [terms.variable ['a']]
                statements.rewrite last statement to return (async: true)

                (statements) should contain fields (
                    terms.statements [
                        terms.function call (
                            terms.callback function
                            [terms.nil (), terms.variable ['a']]
                        )
                    ]
                )

            context "when last statement doesn't return a value"
                statements = terms.statements [
                    terms.while expression (
                        terms.variable ['a']
                        terms.statements [terms.variable ['b']]
                    )
                ]
                statements.rewrite last statement to return (async: true)

                (statements) should contain fields (
                    terms.statements [
                        terms.while expression (
                            terms.variable ['a']
                            terms.statements [terms.variable ['b']]
                        )
                        terms.function call (
                            terms.callback function
                            [terms.nil (), terms.nil ()]
                        )
                    ]
                )

        context 'when not async'
            it 'uses the return statement'
                statements = terms.statements [terms.variable ['a']]
                statements.rewrite last statement to return ()

                (statements) should contain fields (
                    terms.statements [terms.return statement (terms.variable ['a'], implicit: true)]
                )
