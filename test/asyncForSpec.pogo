async = require '../lib/asyncControl'
should = require 'should'
require './assertions'

describe 'for'
    it 'executes each loop sequentially' @(done)
        n = nil
        loops = []
        async.for @(cb) @{n = 0, cb ()} @(cb) @{cb (nil, n < 3)} @(cb) @{n = n + 1, cb ()} @(cb)
            loops.push (n)
            cb ()
        @{
            try
                (loops) should contain fields [0, 1, 2]
                done ()
            catch (error)
                done (error)
        }

    context 'when init returns error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{cb 'init error'} @(cb) @{cb (nil, n < 3)} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields []
                    should.equal (error, 'init error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when init throws error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{throw 'init error'} @(cb) @{cb (nil, n < 3)} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields []
                    should.equal (error, 'init error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when test returns error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{cb 'test error'} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields []
                    should.equal (error, 'test error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when test throws error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{throw 'test error'} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields []
                    should.equal (error, 'test error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when incr returns error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{cb (nil, n < 3)} @(cb) @{cb 'incr error'} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields [0]
                    should.equal (error, 'incr error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when incr throws error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{cb (nil, n < 3)} @(cb) @{throw 'incr error'} @(cb)
                loops.push (n)
                cb ()
            @(error) @{
                try
                    (loops) should contain fields [0]
                    should.equal (error, 'incr error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when loop returns error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{cb (nil, n < 3)} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                cb 'loop error'
            @(error) @{
                try
                    (loops) should contain fields [0]
                    should.equal (error, 'loop error')
                    done ()
                catch (error)
                    done (error)
            }

    context 'when loop throws error'
        it 'returns error' @(done)
            n = nil
            loops = []
            async.for @(cb) @{n = 0, cb()} @(cb) @{cb (nil, n < 3)} @(cb) @{n = n + 1, cb ()} @(cb)
                loops.push (n)
                throw 'loop error'
            @(error) @{
                try
                    (loops) should contain fields [0]
                    should.equal (error, 'loop error')
                    done ()
                catch (error)
                    done (error)
            }
