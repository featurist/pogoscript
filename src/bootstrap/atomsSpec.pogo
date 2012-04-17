atoms = require './atoms.pogo'

(actual) should be (expected) =
    actual: should: equal (expected)

describe 'atoms'
    (atom) has just one argument =
        it 'has just one argument'
            (atom?: arguments?: length) should be 1

    describe 'integer atom'
        @{atoms: integer 8} has just one argument

    describe 'string atom'
        @{atoms: string "abcd"} has just one argument
