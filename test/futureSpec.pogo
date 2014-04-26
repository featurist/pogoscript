script = require './scriptAssertions'

async should output = script.async should output
should output = script.should output

describe 'futures'
    it 'can defer the result of an asynchronous call'
        async! 'x! = 5
                f = x?
                print (f!)
                done ()' should output '5'

    it 'can defer the result of an asynchronous method call'
        async! 'object = {
                    method! = 5
                }
                future = object.method?
                print (future!)
                done ()' should output '5'

    it 'can defer the result of an asynchronous index call'
        async! 'object = {
                    "method"! = 5
                }
                future = object."method"?
                print (future!)
                done ()' should output '5'
    
    it 'only executes the async function once, even though we call the future twice'
        async! 'x! =
                    print "executing"

                f = x?

                f!
                f!

                done ()' should output "'executing'"
    
    it 'returns the same result for each call of the future'
        async! 'x! = 5

                f = x?

                print (f!)
                print (f!)

                done ()' should output "5
                                        5"
    
    it 'executes the async function, even though the future is not invoked'
        async! 'x! =
                    print "executing"

                x?

                done ()' should output "'executing'"
    
    context 'when the async function throws an exception'
        it 'invoking the future throws async error if async function throws async error'
            async! 'x! =
                        throw "error"

                    f = x?

                    try
                        f!
                    catch (error)
                        print (error)

                    done ()' should output "'error'"
    
    context 'when the async function throws an async error'
        it 'invoking the future throws async error if async function throws async error'
            async! 'x! =
                        continuation "error"

                    f = x?

                    try
                        f!
                    catch (error)
                        print (error)

                    done ()' should output "'error'"
        
        it 'invoking the future twice will raise error twice'
            async! 'x! =
                        continuation "error"

                    f = x?

                    try
                        f!
                    catch (error)
                        print (error)

                    try
                        f!
                    catch (error)
                        print (error)

                    done ()' should output "'error'
                                            'error'"

    describe 'futures in async functions'
        it 'still calls the callback when the function is asynchronous'
            async! 'x ()! =
                        y ()?

                    y ()! = 5

                    f = x ()!
                    print (f ()!)
                    done ()' should output '5'

        it 'still calls the callback when the function makes an asynchronous call'
            async! 'x ()! =
                        y ()?
                        z ()!

                    y ()! = 8
                    z ()! = 4

                    print (x ()!)
                    done ()' should output '4'

        it 'still calls the callback when the function is asynchronous and returns a normal result'
            async! 'x ()! =
                        y ()?
                        z

                    y ()! = 8
                    z = 4

                    print (x ()!)
                    done ()' should output '4'

    describe 'giving progress'
        it 'can indicate when the future is complete'
            async! 'wait (n, cb) = setTimeout (cb, n)
                    
                    waitFuture = wait 10?
                    print (waitFuture.complete)

                    wait 1!
                    print (waitFuture.complete)

                    wait 15!
                    print (waitFuture.complete)

                    done ()' should output 'false
                                            false
                                            true'

        it 'can indicate when the future is complete'
            async! 'wait (n, cb) = setTimeout (cb, n)
                    
                    bigWait(cb) =
                        cb.future.progress = "stage 1"
                        setTimeout
                            cb.future.progress = "stage 2"
                            setTimeout
                                cb.future.progress = "stage 3"
                                setTimeout
                                    cb.future.progress = "finished"
                                    cb()
                                10
                            10
                        10

                    f = bigWait?
                    print (f.progress)
                    wait 10!
                    print (f.progress)
                    wait 10!
                    print (f.progress)
                    wait 10!
                    print (f.progress)

                    done ()' should output "'stage 1'
                                            'stage 2'
                                            'stage 3'
                                            'finished'"
