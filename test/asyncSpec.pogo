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
        async 'process.next tick!
               print "finished"
               done ()' should output ("'finished'", done)

    it "makes a block asynchronous if it contains async statements" @(done)
        async 'print result (block) =
                   block @(error, result)
                       print (result)
                       done ()

               print result
                   process.next tick!
                   "finished"' should output ("'finished'", done)
