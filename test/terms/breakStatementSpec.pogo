terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'break statement'
    it 'is never implicitly returned'
        break statement =
            terms.break statement ()

        break statement.rewrite result term into ().should.equal (break statement)

    describe 'code generation'
        it 'generates break expression'
            break statement = terms.break statement ()

            (break statement) should generate statement 'break;'
