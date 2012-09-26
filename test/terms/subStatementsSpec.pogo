terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'sub statements term'
    describe 'serialise sub statements'
        it 'adds all but the last statement, and returns the last statement'
            sub statement = terms.sub statements [
                terms.variable ['a']
                terms.variable ['b']
                terms.variable ['c']
            ]

            statements = []
            returned statement = sub statement.serialise sub statements (statements)

            (statements) should contain fields [
                terms.variable ['a']
                terms.variable ['b']
            ]

            (returned statement) should contain fields (terms.variable ['c'])
