terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'return statement'
    it 'is never implicitly returned'
        closure =
            terms.closure (
                []
                terms.statements [
                    terms.return statement (terms.variable ['a'])
                ]
            )

        expanded closure = closure.expand macros ()

        (expanded closure) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.return statement (terms.variable ['a'])
                ]
            )
        )

    describe 'code generation'
        it 'generates return expression'
            return statement = terms.return statement (terms.variable ['a'])

            (return statement) should generate statement 'return a;'

        it 'generates return void'
            return statement = terms.return statement ()

            (return statement) should generate statement 'return;'
