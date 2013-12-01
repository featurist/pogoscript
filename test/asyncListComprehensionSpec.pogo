async = require '../lib/asyncControl'
should = require 'should'
require './assertions'

describe 'generate'
    it 'returns the mapped results'
        results = async.list comprehension! ([1, 2, 3], false) @(index, item, add result)
            add result (item + 1, index)

        (results).should.eql [2, 3, 4]

    it "doesn't wait for loop body to complete before moving onto next"
        loops = []

        async.list comprehension! (['first', 'second'], false) @(index, item, add result)
            loops.push "before async: #(item)"
            process.next tick!
            loops.push "after async: #(item)"

        loops.should.eql [
            'before async: first'
            'before async: second'
            'after async: first'
            'after async: second'
        ]

    context 'with an empty list'
        it "returns"
            results = async.list comprehension! ([], false) @(index, item, add result)
                nil

            results.should.eql []

    context 'when different iterations take differing amounts of time'
        it "the results correspond to the order of the input list"
            wait (n, cb) = set timeout (cb, n)

            results = async.list comprehension! ([30, 10, 20], false) @(index, item, add result)
                wait (item)!
                add result (item, index)

            results.should.eql [30, 10, 20]

    context 'when adding ranges'
        it "the result ranges are flattened into the results"
            wait (n, cb) = set timeout (cb, n)

            results = async.list comprehension! ([30, 10, 20], true) @(index, item, add result)
                wait (item)!
                add result ([item, 1], index)

            results.should.eql [30, 1, 10, 1, 20, 1]
