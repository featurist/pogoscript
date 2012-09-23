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

    when while has the following loops (loops) then (assertions) =
        current loop index = 0
        loops executed = 0
        current loop = nil

        condition () =
            current loop = loops.(current loop index)
            current loop index = current loop index + 1
            current loop.condition

        loop () =
            current loop.loop ()

        async.while @{ condition () }
            loops executed = loops executed + 1
            loop ()
        @(error, result)
            should.equal (error, assertions.error)
            should.equal (result, nil)
            should.equal (loops executed, assertions.loops executed)

    context 'condition starts false'
        it 'skips the while statement'
            when while has the following loops [
                {condition = false, loop = does nothing}
            ] then {
                loops executed = 0
            }

    context 'when the condition is true for the first 5 times'
        it 'executes the loop once'
            when while has the following loops [
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns true, loop = does nothing}
                {condition = returns false, loop = does nothing}
            ] then {
                loops executed = 5
            }

    context 'condition returns true'
        context 'loop returns'
            it 'ignores the loop result'
                when while has the following loops [
                    {condition = returns true, loop = returns 'result 1'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 1
                }

        context 'loop throws'
            it 'returns the loop error'
                when while has the following loops [
                    {condition = returns true, loop = throws 'error'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 1
                    error = 'error'
                }

        context 'loop returns error'
            it 'returns the loop error'
                when while has the following loops [
                    {condition = returns true, loop = returns error 'error'}
                    {condition = returns true, loop = returns 'result 2'}
                    {condition = returns false, loop = returns 'result 3'}
                ] then {
                    loops executed = 1
                    error = 'error'
                }

    context 'condition throws'
        it 'ignores the loop result'
            when while has the following loops [
                {condition = throws 'condition error', loop = does nothing}
            ] then {
                loops executed = 0
                error = 'condition error'
            }

    context 'condition returns error'
        it 'ignores the loop result'
            when while has the following loops [
                {condition = returns error 'condition error', loop = does nothing}
            ] then {
                loops executed = 0
                error = 'condition error'
            }
