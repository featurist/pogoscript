script = require './scriptAssertions'

should output = script.should output
async should output = script.async should output

describe 'list comprehensions'
    describe 'map'
        it 'can do the identity map'
            'print [x, where: x <- [1, 2, 3]]' should output '[ 1, 2, 3 ]'

        it 'can map items to new values'
            'print [x + 1, where: x <- [1, 2, 3]]' should output '[ 2, 3, 4 ]'

        it 'can map items to new values with async function'
            async 'f! (x) =
                       async!()
                       x + 1

                   print [f!(x), where: x <- [1, 2, 3]]' should output '[ 2, 3, 4 ]'

    describe 'filter'
        it 'can filter out items before mapping'
            'print [x, where: x <- [1, 2, 3], x > 1]' should output '[ 2, 3 ]'

        it 'can filter out items before mapping with async filter'
            async 'f! (x) =
                       async!()
                       x > 1

                   print [x, where: x <- [1, 2, 3], f! (x)]' should output '[ 2, 3 ]'

    describe 'definitions'
        it 'can map a new definition'
            'print [y, where: x <- [1, 2, 3], y = x + 1]' should output '[ 2, 3, 4 ]'

        it 'can map a new definition with async function'
            async 'f! (x) =
                       async!()
                       x + 1

                   print [y, where: x <- [1, 2, 3], y = f! (x)]' should output '[ 2, 3, 4 ]'
            
    describe 'iteration within iteration'
        it 'can iterate within an iterator'
            'print [[x, y], where: x <- [1, 2], y <- [-1, -2]]' should output '[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]'

        it 'can map a new definition with async function'
            async 'f! (x) =
                       async!()
                       [x, -x]

                   print [[x, y], where: x <- [1, 2], y <- f! (x)]' should output '[ [ 1, 1 ], [ 1, -1 ], [ 2, 2 ], [ 2, -2 ] ]'
            
    describe 'combinations'
        it 'iterate, then filter, then map, then iterate, then map'
            'print [z, where: x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y]]' should output '[ 1, 4, 1, 16 ]'
