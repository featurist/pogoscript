terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'
should = require 'should'

describe 'while expression'
    it 'is never implicitly returned'
        while expression = terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])

        should.equal (while expression.rewrite result term into (), nil)

    describe 'code generation'
        it 'generates while expression'
            while expression = terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])

            (while expression) should generate statement 'while(condition){body;}'
