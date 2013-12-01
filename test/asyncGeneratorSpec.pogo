async = require '../lib/asyncControl'
should = require 'should'
require './assertions'

describe 'generate'
    it 'executes the block for each item in the list'
        loops = []

        async.generate! [1, 2, 3] @(index, item)
            loops.push [index, item]

        (loops) should contain fields [[0, 1], [1, 2], [2, 3]]

    it "doesn't wait for loop body to complete before moving onto next"
        loops = []

        async.generate! ['first', 'second'] @(index, item)
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

            async.generate! [] @(index, item)
                loops.push (item)
                process.next tick!

            (loops) should contain fields []

describe 'sort each'
    it 'takes each result with an index and sorts them'
        results = async.sort results @(add result with index)!
            add result 'three' with index 3
            process.next tick!

            add result 'two' with index 2
            process.next tick!

            add result 'four' with index 4
            process.next tick!

        (results).should.eql ['two', 'three', 'four']

    it 'takes each result as a range with an index and sorts them'
        results = async.sort result ranges @(add results with index)!
            add results ['three', 'four'] with index 3
            process.next tick!

            add results ['six', 'eight'] with index 2
            process.next tick!

            add results ['eleven', 'fourteen'] with index 6
            process.next tick!

        (results).should.eql ['six', 'eight', 'three', 'four', 'eleven', 'fourteen']
