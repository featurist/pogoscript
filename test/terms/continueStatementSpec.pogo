terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'continue statement'
    it 'is never implicitly returned'
        closure =
            terms.closure (
                []
                terms.statements [
                    terms.continue statement ()
                ]
            )

        expanded closure = closure.rewrite ()

        (expanded closure) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.continue statement ()
                ]
            )
        )

    describe 'code generation'
        it 'generates continue expression'
            continue statement = terms.continue statement ()

            (continue statement) should generate statement 'continue;'
