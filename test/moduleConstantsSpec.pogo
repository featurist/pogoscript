terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require './assertions'

describe 'module constants'
    it 'ignores the second definition of a constant'
        module = terms.module (
            terms.statements [
                terms.variable ['a']
            ]
            in scope: false
        )

        pi variable = terms.module constants.define ['pi'] as (terms.float 3.142)
        terms.module constants.define ['pi'] as (terms.float 3)

        (terms.module constants.definitions ()) should contain fields [
            terms.definition (
                pi variable
                terms.float 3.142
            )
        ]

    it 'all definitions of the same constant return the same variable'
        first pi = terms.module constants.define ['pi'] as (terms.float 3.142)
        second pi = terms.module constants.define ['pi'] as (terms.float 3)

        first pi.should.equal (second pi)
