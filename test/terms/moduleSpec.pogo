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

            expanded module = module.expand macros ()

            method call = terms.method call (
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

            (expanded module) should contain fields (
                terms.module (
                    terms.statements [
                        method call = terms.method call (
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
                )
            )

    it 'returns last statement, without a scope'
        module = terms.module (
            terms.statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ]
        )

        module.in scope = false
        module.return last statement = true

        expanded module = module.expand macros ()

        (expanded module) should contain fields (
            terms.module (
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.return statement (terms.variable ['c'], implicit: true)
                ]
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
        )

        module.in scope = false
        module.global = true

        expanded module = module.expand macros ()

        statements = terms.statements ([
            terms.variable ['a']
            terms.variable ['b']
            terms.variable ['c']
        ], global: true)

        (expanded module) should contain fields (
            terms.module (
                terms.statements ([
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ], global: true)
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
            )

            (module) should generate module ('a;b;c;')
