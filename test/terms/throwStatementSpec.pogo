terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'throw statement'
    it 'is never returned'
        closure =
            terms.closure (
                []
                terms.statements [
                    terms.throw statement (terms.variable ['a'])
                ]
            )

        expanded closure = closure.rewrite ()

        (expanded closure) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.throw statement (terms.variable ['a'])
                ]
            )
        )

    describe 'code generation'
        it 'generates throw'
            (terms.throw statement (terms.variable ['a'])) should generate statement ('throw a;')
