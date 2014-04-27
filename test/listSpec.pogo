script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'lists'
    it 'can construct an empty list'
        'print []' shouldOutput '[]'

    it 'can construct a list'
        'print [1, 2, 3]' shouldOutput '[ 1, 2, 3 ]'

    describe 'splats'
        it 'can splat at the end of a list'
            'list = [2, 3]
             print [1, list, ...]' shouldOutput '[ 1, 2, 3 ]'

        it 'can splat in the middle of a list'
            'list = [2, 3]
             print [1, list, ..., 4]' shouldOutput '[ 1, 2, 3, 4 ]'

        it 'can splat at the start of a list'
            'list = [1, 2, 3]
             print [list, ..., 4]' shouldOutput '[ 1, 2, 3, 4 ]'

        it 'can just be a splat'
            'list = [1, 2, 3]
             print [list, ...]' shouldOutput '[ 1, 2, 3 ]'

    describe 'ranges'
        it 'can accept a range'
            'print [1..3]' shouldOutput '[ 1, 2, 3 ]'

        it 'can put a range before other items'
            'print [1..3, 4]' shouldOutput '[ 1, 2, 3, 4 ]'

        it 'can put a range after other items'
            'print [0, 1..3]' shouldOutput '[ 0, 1, 2, 3 ]'
