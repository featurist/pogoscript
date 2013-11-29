async = require '../lib/asyncControl'
should = require 'should'
require './assertions'

describe 'for'
    it 'executes the block for each item in the list'
        loops = []

        async.generate! [1, 2, 3] @(item)
            loops.push (item)

        (loops) should contain fields [1, 2, 3]

    it "doesn't wait for loop body to complete before moving onto next"
        loops = []

        async.generate! ['first', 'second'] @(item)
            loops.push "before async: #(item)"
            process.next tick!
            loops.push "after async: #(item)"

        (loops) should contain fields [
            'before async: first'
            'before async: second'
            'after async: first'
            'after async: second'
        ]

    context 'with an empty list'
        it "returns"
            loops = []

            async.generate! [] @(item)
                loops.push (item)
                process.next tick!

            (loops) should contain fields []
