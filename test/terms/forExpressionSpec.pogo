terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'
should = require 'should'

describe 'for expression term'
    it 'is never returned'
        for expression =
            terms.for expression (
                terms.definition (terms.variable ['i'], terms.integer 0)
                terms.operator ('<', [terms.variable ['i'], terms.integer 10])
                terms.definition (terms.variable ['i'], terms.operator ('+', [terms.variable ['i'], terms.integer 1]))
                terms.statements [terms.variable ['x']]
            )

        should.equal (for expression.rewrite result term into (), nil)
