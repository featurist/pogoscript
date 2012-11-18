terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'continue statement'
    it 'is never implicitly returned'
        continue statement =
            terms.continue statement ()

        continue statement.rewrite result term into ().should.equal (continue statement)

    describe 'code generation'
        it 'generates continue expression'
            continue statement = terms.continue statement ()

            (continue statement) should generate statement 'continue;'
