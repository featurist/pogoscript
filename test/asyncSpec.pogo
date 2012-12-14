script = require './scriptAssertions'

async should output = script.async should output
should output = script.should output

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

    it 'it only exits once' @(done)
        async "do stuff! =
                   async!
                   process.next tick!
                   async!
               
               do stuff!
               
               print 'finished'
               done ()" should output ("'finished'", done)

    it 'single async call can be made in scopified assignment' @(done)
        async "f!() = 8

               x =
                   f!()

               print (x)

               done ()" should output ("8", done)

    it 'async call expression can be made in scopified assignment' @(done)
        async "f!() = 8

               x =
                   f!() * 2

               print (x)

               done ()" should output ("16", done)

    it 'statements including async call can be made in scopified assignment' @(done)
        async "f!() = 8

               x =
                   n = f!()
                   n * 2

               print (x)

               done ()" should output ("16", done)

    it 'it can chain async methods' @(done)
        async "one!() =
                   async!()
                   {
                       two!() =
                           async!()
                           'finished'
                   }

               print (one!().two!())
               done ()" should output ("'finished'", done)

    it 'throws if async function is not called asynchronously'
        @{"f!() = 12

           print (f ())" should output ("'finished'")}.should.throw 'asynchronous function called synchronously'

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

        context 'without else clause inside async function'
            it 'returns via callback when condition is false' @(done)
                async 'f! =
                           if (false)
                               "result"

                       f!
                       done ()' should output ('', done)

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
            
    describe 'while expression'
        it 'executes each loop one after the other' @(done)
            async "condition = true
                   get condition! = condition

                   while (get condition!)
                       print 'loop'
                       async!
                       condition := false

                   done ()" should output ("'loop'", done)

        it "completes the function as the last statement" @(done)
            async "f! () =
                       while (false)
                           never here ()
                   
                   f! ()
                   done ()" should output ("", done)
            
    describe 'for expression'
        it 'executes each loop one after the other' @(done)
            async "for (n = 0, n < 3, ++n)
                       print ('before: ' + n)
                       async!
                       print ('after: ' + n)

                   done ()" should output ("'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done)

        it "completes the function as the last statement" @(done)
            async "f! () =
                       for (n = 0, n < 3, ++n)
                           print 'loop'
                   
                   f! ()
                   done ()" should output ("'loop'\n'loop'\n'loop'", done)

        it "doesn't return as last statement if body contains continuation" @(done)
            async "repeat! (times) times =
                       for (n = 0, n < times, ++n)
                           continuation (nil, n)

                   n = repeat! 1 times

                   print (n)
                   done ()" should output ("0", done)
            
    describe 'for each expression'
        it 'executes each loop one after the other' @(done)
            async "for each @(n) in [0, 1, 2]
                       print ('before: ' + n)
                       async!
                       print ('after: ' + n)

                   done ()" should output ("'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done)

        it "completes the function as the last statement" @(done)
            async "f! () =
                       for each @(n) in [0, 1, 2]
                           print ('before: ' + n)
                           async!
                           print ('after: ' + n)
                   
                   f! ()
                   done ()" should output ("'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done)

        it "doesn't return as last statement if body contains continuation" @(done)
            async "repeat! (times) times =
                       for each @(n) in [0]
                           continuation (nil, n)

                   n = repeat! 1 times

                   print (n)
                   done ()" should output ("0", done)
            
    describe 'for in expression'
        it "completes the function as the last statement" @(done)
            async "f! () =
                       for @(n) in {a = 1, b = 2}
                           print (n)
                   
                   f! ()
                   done ()" should output ("'a'\n'b'", done)

        it "doesn't return as last statement if body contains continuation" @(done)
            async "repeat! (times) times =
                       for @(n) in {a = 1}
                           continuation (nil, n)

                   n = repeat! 1 times

                   print (n)
                   done ()" should output ("'a'", done)

    describe 'splat arguments'
        it 'can handle splat arguments in an async function' @(done)
            async "f! (a, ...) =
                       a

                   print (f! (1, 2, 3))
                   done ()" should output ("[ 1, 2, 3 ]", done)

    describe 'return'
        context 'when in an async function'
            it 'is rewritten to call the callback' @(done)
                async 'f! =
                           return "result"

                       print (f!)
                       done ()' should output ("'result'", done)

    describe 'continuation'
        it 'can be called in an async function as the callback' @(done)
            async 'f! =
                       continuation (nil, "result")

                   print (f!)
                   done ()' should output ("'result'", done)

        it 'can be passed to another function as the callback' @(done)
            async 'g! = "result"

                   f! = g (continuation)

                   print (f!)
                   done ()' should output ("'result'", done)
