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

        (closure) should contain fields (
            terms.closure (
                []
                terms.statements [
                    terms.throw statement (terms.variable ['a'])
                ]
                return last statement: false
            )
        )

    describe 'code generation'
        it 'generates throw'
            (terms.throw statement (terms.variable ['a'])) should generate statement ('throw a;')
