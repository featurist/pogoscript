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
