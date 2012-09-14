terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'module term'
    describe 'scoped module'
        it 'puts statements into a scope, passing the file `this`'
            module = terms.module (
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ]
            )

            expected module = terms.module (
                terms.statements [
                    terms.method call (
                        terms.sub expression (
                            terms.closure (
                                []
                                terms.statements [
                                    terms.variable ['a']
                                    terms.variable ['b']
                                    terms.variable ['c']
                                ]
                                return last statement: false
                                redefines self: true
                            )
                        )
                        ['call']
                        [terms.variable ['this']]
                    )
                ]
                in scope: false
            )

            (module) should contain fields (expected module)

    it 'returns last statement, without a scope'
        module = terms.module (
            terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ]
            return last statement: true
            in scope: false
        )

        (module) should contain fields (
            terms.module (
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.return statement (terms.variable ['c'], implicit: true)
                ]
                in scope: false
            )
        )

    it "doesn't return last statement, without a scope"
        module = terms.module (
            terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ]
        )

        module.in scope = false

        expanded module = module.expand macros ()

        (expanded module) should contain fields (
            terms.module (
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ]
            )
        )

    it "doesn't return last statement, without a scope, making global statements"
        module = terms.module (
            terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ]
            in scope: false
            global: true
        )

        (module) should contain fields (
            terms.module (
                terms.statements ([
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ], global: true)
                in scope: false
                global: true
            )
        )

    describe 'code generation'
        it 'generates statements'
            module = terms.module (
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ]
                in scope: false
            )

            (module) should generate module ('a;b;c;')

        it 'generates module constants'
            module = terms.module (
                terms.statements [
                    terms.variable ['a']
                ]
                in scope: false
            )

            terms.module constants.define ['pi'] as (terms.float 3.142)

            (module) should generate module ('var gen1_pi;gen1_pi=3.142;a;')
