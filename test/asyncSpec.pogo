script = require './scriptAssertions'

async should output = script.async should output

describe 'async'
    it 'can make one async call in statements' @(done)
        async 'f (callback) =
                   set timeout
                       callback (nil, "result")
                   0
       
               x = f ()!
               print (x)
               done ()' should output ("'result'", done)

    it 'can make one async call as argument to another function' @(done)
        async 'f (callback) =
                   set timeout
                       callback (nil, "result")
                   0
       
               print (f ()!)
               done ()' should output ("'result'", done)

    it "an async function returns its result in a callback" @(done)
        async 'as (f) =
                   set timeout
                       f (nil, 4)
                   0
               
               fn ()! =
                   as ()!
               
               print (fn ()!)
               done ()' should output ("4", done)
