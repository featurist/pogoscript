script = require './scriptAssertions'

asyncShouldOutput = script.asyncShouldOutput
shouldOutput = script.shouldOutput

describe 'promises'
  it 'converts callback style to a promise'
    async 'f (cb) =
             setTimeout
               cb (nil, "result")
             400
           
           print (f ^ !)
           done ()' shouldOutput '"result"'
