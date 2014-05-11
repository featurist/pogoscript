script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'promises'
  it 'can resolve a promise'
    'print (promise 6!)' shouldOutput "6"

  it 'only exits once'
    'a() =
       promise ()!

     a()!
     print "finished"' shouldOutput "'finished'"

  describe 'callbacks'
    it 'converts callback style to a promise'
      'f (cb) =
         setTimeout
           cb (nil, "result")
         1
       
       print (f ^!)' shouldOutput "'result'"
