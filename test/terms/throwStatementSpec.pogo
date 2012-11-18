terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'throw statement'
    it 'is never returned'
        throw statement = terms.throw statement (terms.variable ['a'])
        throw statement.rewrite result term into ().should.equal (throw statement)

    describe 'code generation'
        it 'generates throw'
            (terms.throw statement (terms.variable ['a'])) should generate statement ('throw a;')
