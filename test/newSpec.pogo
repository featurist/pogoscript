script = require './scriptAssertions'

describe 'new'
    it 'can construct with arguments'
        script.'c (n) = =>
                    this.n = n
                    nil

                print (new (c 7))' should output '{ n: 7 }'

    it 'can construct without arguments'
        script.'c () = =>
                    this.n = "n"
                    nil

                print (new (c))' should output '{ n: ''n'' }'

    it 'can construct without arguments and get field reference'
        script.'c () = =>
                    this.n = "n"
                    nil

                print ((new (c)).n)' should output '''n'''

    it 'can construct with splat arguments'
        script.'c (a, b, c) = =>
                    this.a = a
                    this.b = b
                    this.c = c
                    nil

                args = [1, 2, 3]

                print (new (c (args, ...)))' should output '{ a: 1, b: 2, c: 3 }'
