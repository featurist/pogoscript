terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'

describe 'if expression term'
    describe 'returning as last statement'
        it 'returns last statement from then and else bodies'
            expression =
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

            expected if expression = 
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

            expression.rewrite result term @(term) into
                terms.return statement (term, implicit: true)

            (expression) should contain fields (expected if expression)
