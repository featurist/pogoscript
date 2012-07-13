terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'

describe 'if expression term'
    describe 'returning as last statement'
        it 'returns last statement from then and else bodies'
            expression =
                terms.closure (
                    []
                    terms.statements [
                        terms.if expression (
                            [
                                [
                                    terms.variable ['condition', 'a']
                                    terms.statements [
                                        terms.variable ['a']
                                        terms.variable ['b']
                                    ]
                                ]
                                [
                                    terms.variable ['condition', 'b']
                                    terms.statements [
                                        terms.variable ['c']
                                        terms.variable ['d']
                                    ]
                                ]
                            ]
                            terms.statements [
                                terms.variable ['e']
                                terms.variable ['f']
                            ]
                        )
                    ]
                )

            returning if expression = expression.expand macros ()

            expected if expression = 
                terms.closure (
                    []
                    terms.statements [
                        terms.if expression (
                            [
                                [
                                    terms.variable ['condition', 'a']
                                    terms.statements [
                                        terms.variable ['a']
                                        terms.return statement (terms.variable ['b'], implicit: true)
                                    ]
                                ]
                                [
                                    terms.variable ['condition', 'b']
                                    terms.statements [
                                        terms.variable ['c']
                                        terms.return statement (terms.variable ['d'], implicit: true)
                                    ]
                                ]
                            ]
                            terms.statements [
                                terms.variable ['e']
                                terms.return statement (terms.variable ['f'], implicit: true)
                            ]
                        )
                    ]
                )

            (returning if expression) should contain fields (expected if expression)

        it 'expands sub statements'
            expression =
                terms.closure (
                    []
                    terms.statements [
                        terms.if expression (
                            [
                                [
                                    terms.variable ['condition', 'a']
                                    terms.statements [
                                        terms.sub statements [
                                            terms.variable ['a']
                                            terms.variable ['b']
                                        ]
                                    ]
                                ]
                                [
                                    terms.variable ['condition', 'b']
                                    terms.statements [
                                        terms.sub statements [
                                            terms.variable ['c']
                                            terms.variable ['d']
                                        ]
                                    ]
                                ]
                            ]
                            terms.statements [
                                terms.sub statements [
                                    terms.variable ['e']
                                    terms.variable ['f']
                                ]
                            ]
                        )
                    ]
                    return last statement: false
                )

            returning if expression = expression.expand macros ()

            expected if expression = 
                terms.closure (
                    []
                    terms.statements [
                        terms.if expression (
                            [
                                [
                                    terms.variable ['condition', 'a']
                                    terms.statements [
                                        terms.variable ['a']
                                        terms.variable ['b']
                                    ]
                                ]
                                [
                                    terms.variable ['condition', 'b']
                                    terms.statements [
                                        terms.variable ['c']
                                        terms.variable ['d']
                                    ]
                                ]
                            ]
                            terms.statements [
                                terms.variable ['e']
                                terms.variable ['f']
                            ]
                        )
                    ]
                    return last statement: false
                )

            (returning if expression) should contain fields (expected if expression)
