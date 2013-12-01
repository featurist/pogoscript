script = require './scriptAssertions'

should output = script.should output
async should output = script.async should output

describe 'list comprehensions'
    describe 'map'
        it 'can do the identity map'
            'print [x <- [1, 2, 3], x]' should output '[ 1, 2, 3 ]'

        it 'can map items to new values'
            'print [x <- [1, 2, 3], x + 1]' should output '[ 2, 3, 4 ]'

        it 'can map items to new values with async function'
            async! 'f! (x) =
                        async!()
                        x + 1

                    print [x <- [1, 2, 3], f (x)!]
                    done ()' should output '[ 2, 3, 4 ]'

    describe 'filter'
        it 'can filter out items before mapping'
            'print [x <- [1, 2, 3], x > 1, x]' should output '[ 2, 3 ]'

        it 'can filter out items before mapping with async filter'
            async! 'f! (x) =
                        async!()
                        x > 1

                    print [x <- [1, 2, 3], f (x)!, x]
                    done ()' should output '[ 2, 3 ]'

    describe 'definitions'
        it 'can map a new definition'
            'print [x <- [1, 2, 3], y = x + 1, y]' should output '[ 2, 3, 4 ]'

        it 'can map a new definition with async function'
            async! 'f! (x) =
                        async!()
                        x + 1

                    print [x <- [1, 2, 3], y = f! (x), y]
                    done ()' should output '[ 2, 3, 4 ]'
            
    describe 'iteration within iteration'
        it 'can iterate within an iterator'
            'print [x <- [1, 2], y <- [-1, -2], [x, y]]' should output '[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]'

        it 'can map a new definition with async function'
            async! 'f! (x) =
                       async!()
                       [x, -x]

                    print [x <- [1, 2], y <- f! (x), [x, y]]
                    done ()' should output '[ [ 1, 1 ], [ 1, -1 ], [ 2, 2 ], [ 2, -2 ] ]'
            
    describe 'combinations'
        it 'iterate, then filter, then map, then iterate, then map'
            'print [x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y], z]' should output '[ 1, 4, 1, 16 ]'

    describe 'empty arrays'
        it 'returns an empty array'
            'print [x <- [], x]' should output '[]'

        it 'async returns an empty array'
            async! 'print [x <- [], f (x)!]
                    done()' should output '[]'
            
    describe 'concurrency'
        it 'can start all async processes, then wait for futures'

            async! 'a (x)! =
                        print "started #(x)"
                        async!
                        print "finished #(x)"
                        x
                    
                    print [x <- [1, 2, 3], f = a (x)?, f!]
                    done ()' should output "'started 1'
                                            'started 2'
                                            'started 3'
                                            'finished 1'
                                            'finished 2'
                                            'finished 3'
                                            [ 1, 2, 3 ]"

        it 'can start all async processes, then wait for results, no need for futures'

            async! 'a (x)! =
                        print "started #(x)"
                        async!
                        print "finished #(x)"
                        x
                    
                    print [x <- [1, 2, 3], a (x)!]
                    done ()' should output "'started 1'
                                            'started 2'
                                            'started 3'
                                            'finished 1'
                                            'finished 2'
                                            'finished 3'
                                            [ 1, 2, 3 ]"

        context 'when async processes finish at different times'
            it 'still orders the results respecting the input list'

                async! 'wait (n, cb) = set timeout (cb, n)

                        a (x)! =
                            wait (x)!
                            x
                        
                        print [x <- [30, 10, 20], y <- [3, 1, 2], [a (x)!, a (y)!]]
                        done ()' should output "[ [ 30, 3 ],
                                                  [ 30, 1 ],
                                                  [ 30, 2 ],
                                                  [ 10, 3 ],
                                                  [ 10, 1 ],
                                                  [ 10, 2 ],
                                                  [ 20, 3 ],
                                                  [ 20, 1 ],
                                                  [ 20, 2 ] ]"

describe 'list comprehensions old'
    describe 'map'
        it 'can do the identity map'
            'print [x, where: x <- [1, 2, 3]]' should output '[ 1, 2, 3 ]'

        it 'can map items to new values'
            'print [x + 1, where: x <- [1, 2, 3]]' should output '[ 2, 3, 4 ]'

        it 'can map items to new values with async function'
            async! 'f! (x) =
                        async!()
                        x + 1
 
                    print [f!(x), where: x <- [1, 2, 3]]
                    done ()' should output '[ 2, 3, 4 ]'
 
    describe 'filter'
        it 'can filter out items before mapping'
            'print [x, where: x <- [1, 2, 3], x > 1]' should output '[ 2, 3 ]'

        it 'can filter out items before mapping with async filter'
            async! 'f! (x) =
                        async!()
                        x > 1

                    print [x, where: x <- [1, 2, 3], f! (x)]
                    done ()' should output '[ 2, 3 ]'

    describe 'definitions'
        it 'can map a new definition'
            'print [y, where: x <- [1, 2, 3], y = x + 1]' should output '[ 2, 3, 4 ]'

        it 'can map a new definition with async function'
            async! 'f! (x) =
                        async!()
                        x + 1

                    print [y, where: x <- [1, 2, 3], y = f! (x)]
                    done ()' should output '[ 2, 3, 4 ]'
            
    describe 'iteration within iteration'
        it 'can iterate within an iterator'
            'print [[x, y], where: x <- [1, 2], y <- [-1, -2]]' should output '[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]'

        it 'can map a new definition with async function'
            async! 'f! (x) =
                        async!()
                        [x, -x]

                    print [[x, y], where: x <- [1, 2], y <- f! (x)]
                    done ()' should output '[ [ 1, 1 ], [ 1, -1 ], [ 2, 2 ], [ 2, -2 ] ]'
            
    describe 'combinations'
        it 'iterate, then filter, then map, then iterate, then map'
            'print [z, where: x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y]]' should output '[ 1, 4, 1, 16 ]'
