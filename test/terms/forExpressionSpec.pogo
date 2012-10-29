terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
should = require 'should'

describe 'for expression term'
    it 'declares index variable'
        for expression = terms.for expression (
            terms.definition (terms.variable ['i'], terms.integer 0)
            terms.operator ('<', [terms.variable ['i'], terms.integer 10])
            terms.definition (terms.variable ['i'], terms.operator ('+', [terms.variable ['i'], terms.integer 1]))
            terms.statements [terms.variable ['x']]
        )

        variables = []
        for expression.declare variables (variables, new (terms.Symbol Scope))

        (variables) should contain fields ['i']

    it 'is never returned'
        for expression =
            terms.for expression (
                terms.definition (terms.variable ['i'], terms.integer 0)
                terms.operator ('<', [terms.variable ['i'], terms.integer 10])
                terms.definition (terms.variable ['i'], terms.operator ('+', [terms.variable ['i'], terms.integer 1]))
                terms.statements [terms.variable ['x']]
            )

        should.equal (for expression.rewrite result term into (), nil)
