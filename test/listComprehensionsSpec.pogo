script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'list comprehensions'
    describe 'map'
        it 'can do the identity map'
            'print [x <- [1, 2, 3], x]' shouldOutput '[ 1, 2, 3 ]'

        it 'can map items to new values'
            'print [x <- [1, 2, 3], x + 1]' shouldOutput '[ 2, 3, 4 ]'

        it 'can map items to new values with async function'
            'f! (x) =
                 promise()!
                 x + 1

             print [x <- [1, 2, 3], f (x)!]' shouldOutput '[ 2, 3, 4 ]'

    describe 'filter'
        it 'can filter out items before mapping'
            'print [x <- [1, 2, 3], x > 1, x]' shouldOutput '[ 2, 3 ]'

        it 'can filter out items before mapping with async filter'
            'f! (x) =
                 promise()!
                 x > 1

             print [x <- [1, 2, 3], f (x)!, x]' shouldOutput '[ 2, 3 ]'

    describe 'definitions'
        it 'can map a new definition'
            'print [x <- [1, 2, 3], y = x + 1, y]' shouldOutput '[ 2, 3, 4 ]'

        it 'can map a new definition with async function'
            'f! (x) =
                 promise()!
                 x + 1

             print [x <- [1, 2, 3], y = f! (x), y]' shouldOutput '[ 2, 3, 4 ]'
            
    describe 'iteration within iteration'
        it 'can iterate within an iterator'
            'print [x <- [1, 2], y <- [-1, -2], [x, y]]' shouldOutput '[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]'

        it 'can map a new definition with async function'
            'f! (x) =
                promise()!
                [x, -x]

             print [x <- [1, 2], y <- f! (x), [x, y]]' shouldOutput '[ [ 1, 1 ], [ 1, -1 ], [ 2, 2 ], [ 2, -2 ] ]'
            
    describe 'combinations'
        it 'iterate, then filter, then map, then iterate, then map'
            'print [x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y], z]' shouldOutput '[ 1, 4, 1, 16 ]'

    describe 'empty arrays'
        it 'returns an empty array'
            'print [x <- [], x]' shouldOutput '[]'

        it 'async returns an empty array'
            'print [x <- [], f (x)!]' shouldOutput '[]'

    describe 'scope'
        it "variables aren't shared between iterations"
            'fs = [x <- [1, 2, 3], @{ x }]
             print [f <- fs, f ()]' shouldOutput '[ 1, 2, 3 ]'

    describe 'concurrency'
        it 'can start all async processes, then wait for futures'

            'a (x)! =
                 print "started #(x)"
                 promise()!
                 print "finished #(x)"
                 x
             
             print [x <- [1, 2, 3], f = a (x)?, f!]' shouldOutput "'started 1'
                                                                   'started 2'
                                                                   'started 3'
                                                                   'finished 1'
                                                                   'finished 2'
                                                                   'finished 3'
                                                                   [ 1, 2, 3 ]"

        it 'can start all async processes, then wait for results, no need for futures'
            'a (x)! =
                 print "started #(x)"
                 promise()!
                 print "finished #(x)"
                 x
             
             print [x <- [1, 2, 3], a (x)!]' shouldOutput "'started 1'
                                                           'started 2'
                                                           'started 3'
                                                           'finished 1'
                                                           'finished 2'
                                                           'finished 3'
                                                           [ 1, 2, 3 ]"

        context 'when async processes finish at different times'
            it 'still orders the results respecting the input list'
                'wait (n, cb) = set timeout (cb, n)

                 a (x)! =
                     wait (x)!
                     x
                 
                 print [x <- [30, 10, 20], y <- [3, 1, 2], [a (x)!, a (y)!]]
                 ' shouldOutput "[ [ 30, 3 ],
                                   [ 30, 1 ],
                                   [ 30, 2 ],
                                   [ 10, 3 ],
                                   [ 10, 1 ],
                                   [ 10, 2 ],
                                   [ 20, 3 ],
                                   [ 20, 1 ],
                                   [ 20, 2 ] ]"
