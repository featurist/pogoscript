terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'

describe 'for in'
    it 'scopes body'
        for in expression = terms.for in (
            terms.variable ['i']
            terms.variable ['items']
            terms.statements [
                terms.variable ['i']
            ]
        )

        (for in expression.statements) should contain fields (
            terms.sub expression (
                terms.function call (
                    terms.block (
                        [terms.variable ['i']]
                        terms.statements [
                            terms.variable ['i']
                        ]
                        return last statement: false
                    )
                    [terms.variable ['i']]
                )
            )
        )

    it 'never returns'
        for in expression =
            terms.closure (
                []
                terms.statements [
                    terms.for in (
                        terms.variable ['i']
                        terms.variable ['items']
                        terms.statements [
                            terms.variable ['i']
                        ]
                    )
                ]
            )

        (for in expression) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.for in (
                        terms.variable ['i']
                        terms.variable ['items']
                        terms.statements [
                            terms.variable ['i']
                        ]
                    )
                ]
                return last statement: false
            )
        )
