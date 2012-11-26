script = require './scriptAssertions'

should output = script.should output

describe 'list comprehensions'
    describe 'map'
        it 'can do the identity map'
            'print [x, where: x <- [1, 2, 3]]' should output '[ 1, 2, 3 ]'

        it 'can map items to new values'
            'print [x + 1, where: x <- [1, 2, 3]]' should output '[ 2, 3, 4 ]'

    describe 'filter'
        it 'can filter out items before mapping'
            'print [x, where: x <- [1, 2, 3], x > 1]' should output '[ 2, 3 ]'
            
    describe 'definitions'
        it 'can map a new definition'
            'print [y, where: x <- [1, 2, 3], y = x + 1]' should output '[ 2, 3, 4 ]'
            
    describe 'iteration within iteration'
        it 'can iterate within an iterator'
            'print [[x, y], where: x <- [1, 2], y <- [-1, -2]]' should output '[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]'
            
    describe 'combinations'
        it 'iterate, then filter, then map, then iterate, then map'
            'print [z, where: x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y]]' should output '[ 1, 4, 1, 16 ]'
            
