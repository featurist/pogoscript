script = require './scriptAssertions'

describe 'new'
    it 'can construct with arguments'
        script.'c (n) = =>
                    this.n = n
                    nil

                print (new (c 7))' shouldOutput '{ n: 7 }'

    it 'can construct without arguments'
        script.'c () = =>
                    this.n = "n"
                    nil

                print (new (c))' shouldOutput '{ n: ''n'' }'

    it 'can construct without arguments and get field reference'
        script.'c () = =>
                    this.n = "n"
                    nil

                print ((new (c)).n)' shouldOutput '''n'''

    it 'can construct with splat arguments'
        script.'c (a, b, c) = =>
                    this.a = a
                    this.b = b
                    this.c = c
                    nil

                args = [1, 2, 3]

                print (new (c (args, ...)))' shouldOutput '{ a: 1, b: 2, c: 3 }'
