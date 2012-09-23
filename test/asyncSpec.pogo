script = require './scriptAssertions'

async should output = script.async should output

describe 'async'
    it 'can make one async call in statements' @(done)
        async 'f (callback) =
                   process.next tick
                       callback (nil, "result")
       
               x = f ()!
               print (x)
               done ()' should output ("'result'", done)

    it 'can make two async calls in a row' @(done)
        async 'aprint! (msg) =
                   async!
                   print (msg)
               
               aprint! "one"
               aprint! "two"
               print "finished"
               done ()' should output ("'one'\n'two'\n'finished'", done)

    it 'can make one async call as argument to another function' @(done)
        async 'f (callback) =
                   process.next tick
                       callback (nil, "result")
       
               print (f ()!)
               done ()' should output ("'result'", done)

    it "an async function returns its result in a callback" @(done)
        async 'as (f) =
                   process.next tick
                       f (nil, 4)
               
               fn () =
                   as ()!
               
               print (fn ()!)
               done ()' should output ("4", done)

    it "an async function can be passed an async block, which in turn returns its result in a callback" @(done)
        async 'tick (callback) =
                   process.next tick
                       callback ()
               
               async fun (block, callback) =
                   block (callback)
               
               result = async fun!
                   tick!
                   "result"
               
               print (result)
               done ()' should output ("'result'", done)

    it "an async method call works in the same way as an async function call" @(done)
        async 'async!
               print "finished"
               done ()' should output ("'finished'", done)

    it "makes a block asynchronous if it contains async statements" @(done)
        async 'print result (block) =
                   block @(error, result)
                       print (result)
                       done ()

               print result
                   async!
                   "finished"' should output ("'finished'", done)

    context 'when an async function is called with a block'
        it 'asyncifies the block' @(done)
            async 'func! (block) = block!

                   f = func!
                       "asdf"

                   print (f)
                   done ()' should output ("'asdf'", done)

    it 'thrown exceptions are passed to the error argument of the callback' @(done)
        async 'f () =
                   async!
                   throw (new (Error "thing"))

               f(done)' should output ("") @(error)
            error.message.should.equal 'thing'
            done ()

    describe 'if statements'
        it 'if statements with async bodies wait until the body has finished' @(done)
            async 'if (true)
                       async!
                       print "one"

                   print "two"
                   done ()' should output ("'one'\n'two'", done)

        it 'if statements with async bodies and an else body wait until the body has finished' @(done)
            async 'if (false)
                       async!
                       print "one"
                   else
                       print "two"

                   print "three"
                   done ()' should output ("'two'\n'three'", done)

        it 'if else if else statements with async bodies wait until the body has finished' @(done)
            async 'if (false)
                       async!
                       print "one"
                   else if (false)
                       async!
                       print "two"
                   else
                       async!
                       print "three"

                   print "four"
                   done ()' should output ("'three'\n'four'", done)

    describe 'try statements'
        it "waits for the body to finish" @(done)
            async 'try
                       async!
                       print "one"
                   catch (error)
                       async!
                       print (error)
                   finally
                       async!
                       print "finally"

                   print "finished"
                   done ()' should output ("'one'\n'finally'\n'finished'", done)
            
