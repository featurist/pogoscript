atoms = require './atoms.pogo'

(actual) should be (expected) =
    actual: should: equal (expected)

(atoms) with form (forms) =
    result = {}

    for @(method name) in (atoms)
        if (atoms: has own property (method name))
            result: (method name) (args, ...) =
                atoms: (method name) (forms, args, ...)
    
    result

atoms = (atoms) with form {}

describe 'atoms'
    (atom) has just one argument =
        it 'has just one argument'
            (atom?: arguments?: length) should be 1

    (atom) has no arguments =
        it 'has no arguments'
            (atom?: arguments?: length) should be 0

    (atom) has (n) block parameters =
        it "has #(n) block parameters"
            (atom?: block parameters?: length) should be n

    describe 'argument atom'
        @{atoms: argument 'x'} has just one argument

    describe 'block parameter atom'
        @{atoms: block parameters ['x']} has no arguments
        @{atoms: block parameters ['x', 'y']} has 2 block parameters

    describe 'word atom'
        @{atoms: word 'one'} has no arguments
    
    describe 'block parameter atom'
        @{atoms: block parameters []}