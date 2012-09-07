terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'while expression'
    it 'is never implicitly returned'
        closure =
            terms.closure (
                []
                terms.statements [
                    terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])
                ]
            )

        expanded closure = closure.rewrite ()

        (expanded closure) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])
                ]
            )
        )

    describe 'code generation'
        it 'generates while expression'
            while expression = terms.while expression (terms.variable ['condition'], terms.statements [terms.variable ['body']])

            (while expression) should generate statement 'while(condition){body;}'
