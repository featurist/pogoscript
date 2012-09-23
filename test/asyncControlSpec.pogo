async = require '../lib/asyncControl'
should = require 'should'

describe 'async control functions'
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
                catch @(ex)
                    done (ex)

        it 'calls the callback with the error when the then throws' @(done)
            async.if (true) @(callback)
                throw 'error'
            @(error, result)
                try
                    error.should.equal 'error'
                    should.not.exist (result)
                    done ()
                catch @(ex)
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
                catch @(ex)
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
                catch @(ex)
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

    describe 'try statement'
        throws (error) =
            with callback (callback) =
                throw (error)

        returns error (error) =
            with callback (callback) =
                callback (error)

        returns (result) =
            with callback (callback) =
                callback (nil, result)

        does nothing (callback) = callback ()

        when the (body: nil, catch body: nil, finally body: nil) then (assertions) and (done) when finished =
            catch body executed = false
            caught error = nil

            catch clause =
                if (catch body)
                    @(error, callback)
                        catch body executed = true
                        caught error = error
                        catch body (callback)

            finally clause =
                if (finally body)
                    @(callback)
                        finally body executed = true
                        finally body (callback)

            async.try @(callback) @{
                body (callback)
            } (catch clause) (finally clause) @(error, result)
                try
                    should.equal (catch body executed, assertions.catch body executed || false)
                    should.equal (caught error, assertions.caught error)
                    should.equal (result, assertions.result)
                    should.equal (error, assertions.error)
                    done ()
                catch @(error)
                    done (error)

        context 'with only a catch clause'
            context 'body returns'
                it "doesn't execute the catch body" @(done)
                    when the (body: returns 'result', catch body: does nothing) then {
                        result = 'result'
                    } and (done) when finished

            context 'body throws'
                context 'catch returns'
                    it "returns the catch result" @(done)
                        when the (body: throws 'error', catch body: returns 'catch result') then {
                            catch body executed
                            caught error = 'error'
                            result = 'catch result'
                        } and (done) when finished

                context 'catch throws'
                    it "returns the catch error" @(done)
                        when the (body: throws 'error', catch body: throws 'catch error') then {
                            catch body executed
                            caught error = 'error'
                            error = 'catch error'
                        } and (done) when finished

                context 'catch returns error'
                    it "returns the catch error" @(done)
                        when the (body: throws 'error', catch body: returns error 'catch error') then {
                            catch body executed
                            caught error = 'error'
                            error = 'catch error'
                        } and (done) when finished

            context 'body returns error'
                context 'catch returns'
                    it "returns the catch result" @(done)
                        when the (body: returns error 'error', catch body: returns 'catch result') then {
                            catch body executed
                            caught error = 'error'
                            result = 'catch result'
                        } and (done) when finished

                context 'catch throws'
                    it "returns the catch error" @(done)
                        when the (body: returns error 'error', catch body: throws 'catch error') then {
                            catch body executed
                            caught error = 'error'
                            error = 'catch error'
                        } and (done) when finished

                context 'catch returns error'
                    it "returns the catch error" @(done)
                        when the (body: returns error 'error', catch body: returns error 'catch error') then {
                            catch body executed
                            caught error = 'error'
                            error = 'catch error'
                        } and (done) when finished

        context 'with only a finally clause'
            context 'body returns'
                context 'finally returns'
                    it "executes the finally body and returns body result" @(done)
                        when the (body: returns 'result', finally body: returns 'finally result') then {
                            finally body executed
                            result = 'result'
                        } and (done) when finished

                context 'finally throws'
                    it "executes the finally body and returns finally thrown error" @(done)
                        when the (body: returns 'result', finally body: throws 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

                context 'finally returns error'
                    it "executes the finally body and returns finally returned error" @(done)
                        when the (body: returns 'result', finally body: returns error 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

            context 'body throws'
                context 'finally returns'
                    it "executes the finally body and returns body error" @(done)
                        when the (body: throws 'error', finally body: returns 'finally result') then {
                            finally body executed
                            error = 'error'
                        } and (done) when finished

                context 'finally throws'
                    it "executes the finally body and returns finally thrown error" @(done)
                        when the (body: throws 'error', finally body: throws 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

                context 'finally returns error'
                    it "executes the finally body and returns finally returned error" @(done)
                        when the (body: throws 'error', finally body: returns error 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

            context 'body returns error'
                context 'finally returns'
                    it "executes the finally body and returns body returned error" @(done)
                        when the (body: returns error 'error', finally body: returns 'finally result') then {
                            finally body executed
                            error = 'error'
                        } and (done) when finished

                context 'finally throws'
                    it "executes the finally body and returns finally thrown error" @(done)
                        when the (body: returns error 'error', finally body: throws 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

                context 'finally returns error'
                    it "executes the finally body and returns finally returned error" @(done)
                        when the (body: returns error 'error', finally body: returns error 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

        context 'with catch and finally clauses'
            context 'body returns'
                context 'finally returns'
                    it "executes the finally body and returns body result" @(done)
                        when the (body: returns 'result', catch body: does nothing, finally body: returns 'finally result') then {
                            finally body executed
                            result = 'result'
                        } and (done) when finished

                context 'finally throws'
                    it "executes the finally body and returns finally thrown error" @(done)
                        when the (body: returns 'result', catch body: does nothing, finally body: throws 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

                context 'finally returns error'
                    it "executes the finally body and returns finally returned error" @(done)
                        when the (body: returns 'result', catch body: does nothing, finally body: returns error 'finally error') then {
                            finally body executed
                            error = 'finally error'
                        } and (done) when finished

            context 'body throws'
                context 'catch returns'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: throws 'error', catch body: returns 'catch result', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                result = 'catch result'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: throws 'error', catch body: returns 'catch result', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: throws 'error', catch body: returns 'catch result', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                context 'catch throws'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: throws 'error', catch body: throws 'catch error', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'catch error'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: throws 'error', catch body: throws 'catch error', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: throws 'error', catch body: throws 'catch error', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                context 'catch returns error'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: throws 'error', catch body: returns error 'catch error', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'catch error'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: throws 'error', catch body: returns error 'catch error', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: throws 'error', catch body: returns error 'catch error', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

            context 'body returns error'
                context 'catch returns'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: returns error 'error', catch body: returns 'catch result', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                result = 'catch result'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: returns error 'error', catch body: returns 'catch result', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: returns error 'error', catch body: returns 'catch result', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                context 'catch throws'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: returns error 'error', catch body: throws 'catch error', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'catch error'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: returns error 'error', catch body: throws 'catch error', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: returns error 'error', catch body: throws 'catch error', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                context 'catch returns error'
                    context 'finally returns'
                        it "executes the finally body and returns catch result" @(done)
                            when the (body: returns error 'error', catch body: returns error 'catch error', finally body: returns 'finally result') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'catch error'
                            } and (done) when finished

                    context 'finally throws'
                        it "executes the finally body and returns finally thrown error" @(done)
                            when the (body: returns error 'error', catch body: returns error 'catch error', finally body: throws 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished

                    context 'finally returns error'
                        it "executes the finally body and returns finally returned error" @(done)
                            when the (body: returns error 'error', catch body: returns error 'catch error', finally body: returns error 'finally error') then {
                                catch body executed
                                caught error = 'error'
                                finally body executed
                                error = 'finally error'
                            } and (done) when finished
