code generator = require '../../lib/parser/codeGenerator'.code generator
terms = code generator ()
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
            
            body statements =
                terms.statements [
                    terms.variable ['a']
                    terms.variable ['b']
                    terms.variable ['c']
                ]

            expected module = terms.module (
                terms.statements [
                    terms.method call (
                        terms.sub expression (
                            terms.closure (
                                []
                                body statements
                                return last statement: false
                                redefines self: true
                                defines module constants: true
                            )
                        )
                        ['call']
                        [terms.variable ['this']]
                    )
                ]
                in scope: false
                body statements: body statements
            )

            (module) should contain fields (expected module)

        context 'with async statements'
            it 'throws error in callback'
                module = terms.module (
                    terms.statements (
                        [
                            terms.variable ['a']
                        ]
                        async: true
                    )
                )

                body statements =
                    terms.statements (
                        [
                            terms.variable ['a']
                        ]
                        async: true
                    )

                expected module = terms.module (
                    terms.statements [
                        terms.method call (
                            terms.sub expression (
                                terms.closure (
                                    []
                                    body statements
                                    return last statement: false
                                    redefines self: true
                                    defines module constants: true
                                )
                            )
                            ['call']
                            [
                                terms.variable ['this']
                                terms.closure (
                                    [terms.generated variable ['error']]
                                    terms.statements [
                                        terms.if expression (
                                            [{
                                                condition = terms.generated variable ['error']
                                                body = terms.statements [
                                                    terms.function call (
                                                        terms.variable ['set', 'timeout']
                                                        [
                                                            terms.closure (
                                                                []
                                                                terms.statements [
                                                                    terms.throw statement (terms.generated variable ['error'])
                                                                ]
                                                            )
                                                            terms.integer 0
                                                        ]
                                                    )
                                                ]
                                            }]
                                        )
                                    ]
                                )
                            ]
                        )
                    ]
                    in scope: false
                    body statements: body statements
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
            terms = code generator ()
            module = terms.module (
                terms.statements [
                    terms.variable ['a']
                ]
            )

            terms.module constants.define ['pi'] as (terms.float 3.142)

            (module) should generate module ('(function(){var gen1_pi=3.142;var self=this;a;}).call(this);')
