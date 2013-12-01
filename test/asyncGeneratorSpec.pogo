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

describe 'list comprehension'
    it 'takes results with indexes and sorts them'
        results = async.sort each @(result)!
            result (3, 'three')
            process.next tick!

            result (2, 'two')
            process.next tick!

            result (4, 'four')
            process.next tick!

        (results).should.eql ['two', 'three', 'four']

    it 'takes results with compound indexes and sorts them'
        results = async.sort each @(result)!
            result ('0.1', 'three')
            process.next tick!

            result ('0.0', 'two')
            process.next tick!

            result ('1.1', 'four')
            process.next tick!

        (results).should.eql ['two', 'three', 'four']
