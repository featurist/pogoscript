async = require '../lib/asyncControl'
should = require 'should'

describe 'while statement'
    throws (error) =
        with callback (callback) =
            throw (error)

    returns error (error) =
        with callback (callback) =
            callback (error)

    returns (result) =
        with callback (callback) =
            callback (nil, result)

    returns true = returns (true)
    returns false = returns (false)

    does nothing (callback) = callback ()

    when while has the following loops (loops) then (assertions) and done (done) =
        current loop index = 0
        loops executed = 0
        current loop = nil

        condition (callback) =
            current loop = loops.(current loop index)
            current loop index = current loop index + 1
            current loop.condition (callback)

        loop (callback) =
            loops executed = loops executed + 1
            current loop.loop (callback)

        async.while (condition, loop) @(error, result)
            try
                should.equal (error, assertions.error)
                should.equal (result, nil)
                should.equal (loops executed, assertions.loops executed)
                done ()
            catch (error)
                done (error)

    context 'condition starts false'
        it 'skips the while statement' @(done)
            debugger
            when while has the following loops [
                {condition = returns false, loop = does nothing}
            ] then {
                loops executed = 0
            } and done (done)

    context 'when the condition is true for the first 5 times'
        it 'executes the loop once' @(done)
            when while has the following loops [
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns false, loop = does nothing}
            ] then {
                loops executed = 5
            } and done (done)

    context 'condition returns true'
        context 'loop returns'
            it 'ignores the loop result' @(done)
                when while has the following loops [
                    {condition = returns true, loop = returns 'result 1'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 2
                } and done (done)

        context 'loop throws'
            it 'returns the loop error' @(done)
                when while has the following loops [
                    {condition = returns true, loop = throws 'error'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 1
                    error = 'error'
                } and done (done)

        context 'loop returns error'
            it 'returns the loop error' @(done)
                when while has the following loops [
                    {condition = returns true, loop = returns error 'error'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 1
                    error = 'error'
                } and done (done)

    context 'condition throws'
        it 'ignores the loop result' @(done)
            when while has the following loops [
                {condition = throws 'condition error', loop = does nothing}
            ] then {
                loops executed = 0
                error = 'condition error'
            } and done (done)

    context 'condition returns error'
        it 'ignores the loop result' @(done)
            when while has the following loops [
                {condition = returns error 'condition error', loop = does nothing}
            ] then {
                loops executed = 0
                error = 'condition error'
            } and done (done)
