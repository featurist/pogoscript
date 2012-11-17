terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'with expression'
    it 'is never implicitly returned'
        with expression = terms.with expression (terms.variable ['subject'], terms.statements [terms.variable ['body']])

        with expression.rewrite result term into ().should.equal (with expression)

    describe 'code generation'
        it 'generates with expression'
            with expression = terms.with expression (terms.variable ['subject'], terms.statements [terms.variable ['body']])

            (with expression) should generate statement 'with(subject){body;}'
