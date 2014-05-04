terms = require '../../lib/parser/codeGenerator'.code generator ()
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
            )

            (statements) should generate global statements 'a=1;b=1;'

        it 'generates local variables'
            statements = terms.statements [
                terms.definition (terms.variable ['a'], terms.integer 1)
                terms.definition (terms.variable ['b'], terms.integer 1)
            ]

            (statements) should generate statements 'var a,b;a=1;b=1;'

    describe 'returning last statement'
        context 'when async'
            it 'calls a continuation function'
                statements = terms.statements [terms.variable ['a']]
                statements.rewrite last statement to return (async: true)

                (statements) should contain fields (
                    terms.statements [
                        terms.return statement (
                            terms.function call (
                                terms.continuation function
                                [terms.nil (), terms.variable ['a']]
                            )
                            implicit: true
                        )
                    ]
                )

            it "when last statement doesn't return a value"
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
                        terms.return statement (
                            terms.function call (
                                terms.continuation function
                                [terms.nil (), terms.nil ()]
                            )
                            implicit: true
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
