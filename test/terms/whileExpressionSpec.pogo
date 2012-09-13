terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'while expression'
    it 'is never implicitly returned'
        while expression = terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])

        while expression.rewrite result term into ().should.equal (while expression)

    describe 'code generation'
        it 'generates while expression'
            while expression = terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])

            (while expression) should generate statement 'while(condition){body;}'
