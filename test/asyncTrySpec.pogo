async = require '../lib/asyncControl'
should = require 'should'

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
        finally body executed = false

        catch clause =
            if (catch body)
                @(error, callback)
                    should.equal (catch body executed, false)
                    catch body executed = true
                    caught error = error
                    catch body (callback)

        finally clause =
            if (finally body)
                @(callback)
                    should.equal (finally body executed, false)
                    finally body executed = true
                    finally body (callback)

        async.try @(callback) @{
            body (callback)
        } (catch clause) (finally clause) @(error, result)
            try
                should.equal (catch body executed, assertions.catch body executed || false)
                should.equal (finally body executed, assertions.finally body executed || false)
                should.equal (caught error, assertions.caught error)
                should.equal (result, assertions.result)
                should.equal (error, assertions.error)
                done ()
            catch (error)
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
