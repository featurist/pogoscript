terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'statements term'
    describe 'code generation'
        it 'generates global variables'
            statements = terms.statements (
                [
                    terms.definition (terms.variable ['a'], terms.integer 1)
                    terms.definition (terms.variable ['b'], terms.integer 1)
                ]
                global: true
            )

            rewritten statements = statements.rewrite ()

            (rewritten statements) should generate statements 'a=1;b=1;'

        it 'generates local variables'
            statements = terms.statements (
                [
                    terms.definition (terms.variable ['a'], terms.integer 1)
                    terms.definition (terms.variable ['b'], terms.integer 1)
                ]
            )

            rewritten statements = statements.rewrite ()

            (rewritten statements) should generate statements 'var a,b;a=1;b=1;'
