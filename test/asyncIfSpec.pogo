async = require '../lib/asyncControl'
should = require 'should'

describe 'if'
    it 'calls the callback with the result of the then' @(done)
        async.if (true) @(callback)
            callback (nil, 'result')
        @(error, result)
            if (error)
                done (error)
            else
                result.should.equal 'result'
                done ()

    it 'calls the callback with the error of the then' @(done)
        async.if (true) @(callback)
            callback 'error'
        @(error, result)
            try
                error.should.equal 'error'
                should.not.exist (result)
                done ()
            catch (ex)
                done (ex)

    it 'calls the callback with the error when the then throws' @(done)
        async.if (true) @(callback)
            throw 'error'
        @(error, result)
            try
                error.should.equal 'error'
                should.not.exist (result)
                done ()
            catch (ex)
                done (ex)

describe 'if else'
    it 'calls the callback with the result of the then' @(done)
        async.if (true) @(callback)
            callback (nil, 'then result')
        else @(callback)
            callback (nil, 'else result')
        @(error, result)
            if (error)
                done (error)
            else
                result.should.equal 'then result'
                done ()

    it 'calls the callback with the error of the then' @(done)
        async.if (true) @(callback)
            callback 'then error'
        else @(callback)
            callback (nil, 'else result')
        @(error, result)
            try
                error.should.equal 'then error'
                should.not.exist (result)
                done ()
            catch (ex)
                done (ex)

    it 'calls the callback with the error when the then throws' @(done)
        async.if (true) @(callback)
            throw 'then error'
        else @(callback)
            callback (nil, 'else result')
        @(error, result)
            try
                error.should.equal 'then error'
                should.not.exist (result)
                done ()
            catch (ex)
                done (ex)

    it 'calls the callback with the result of the else' @(done)
        async.if (false) @(callback)
            callback (nil, 'then result')
        else @(callback)
            callback (nil, 'else result')
        @(error, result)
            if (error)
                done (error)
            else
                result.should.equal 'else result'
                done ()

    it 'calls the callback with the error of the else' @(done)
        async.if (false) @(callback)
            callback (nil, 'then result')
        else @(callback)
            callback 'else error'
        @(error, result)
            error.should.equal 'else error'
            should.not.exist (result)
            done ()

    it 'calls the callback with the error when the else throws' @(done)
        async.if (false) @(callback)
            callback (nil, 'then result')
        else @(callback)
            throw 'else error'
        @(error, result)
            error.should.equal 'else error'
            should.not.exist (result)
            done ()

describe 'if else if else'
    it 'executes the first body when only the first condition is true' @(done)
        async.if else if else (
            [
                {condition = true, body = @(callback) @{callback (nil, 'first result')}}
                {condition = false, body = @(callback) @{callback (nil, 'second result')}}
            ]
        ) @(error, result)
            result.should.equal 'first result'
            should.not.exist (error)
            done ()

    it 'executes the second body when only the second condition is true' @(done)
        async.if else if else (
            [
                {condition = false, body = @(callback) @{callback (nil, 'first result')}}
                {condition = true, body = @(callback) @{callback (nil, 'second result')}}
            ]
        ) @(error, result)
            result.should.equal 'second result'
            should.not.exist (error)
            done ()

    it 'returns an error if the body throws' @(done)
        async.if else if else (
            [
                {condition = true, body = @(callback) @{throw 'error'}}
            ]
        ) @(error, result)
            error.should.equal 'error'
            should.not.exist (result)
            done ()

    it 'returns nil if no conditions are true' @(done)
        async.if else if else (
            [
                {condition = false, body = @(callback) @{throw 'error'}}
            ]
        ) @(error, result)
            should.not.exist (result)
            should.not.exist (error)
            done ()
