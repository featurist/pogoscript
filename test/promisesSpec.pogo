script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'promises'
  it 'can resolve a promise'
    'print (p 6!)' shouldOutput "6"

  it 'only exits once'
    'a() =
       p ()!

     a()!
     print "finished"' shouldOutput "'finished'"

  describe 'callbacks'
    it 'converts callback style to a promise'
      'f (cb) =
         setTimeout
           cb (nil, "result")
         1
       
       print (f ^!)' shouldOutput "'result'"

    it '^!. can be used'
      'f (cb) =
         setTimeout
           cb (nil, {result = "result"})
         1
       
       print (f ^!.result)' shouldOutput "'result'"

    it '^. can be used'
      'f (cb) =
         setTimeout
           cb (nil, {result = "result"})
         1
       
       print (f ^.field)' shouldOutput "undefined"

  describe 'explicit promises'
    it 'can create explicit promises'
      'x = promise @(success)
        success "result"

       print (x!)' shouldOutput "'result'"

    it 'an exception inside promise causes the promise to fail'
      'x = promise @(success)
        throw (new (Error "uh oh"))

       try
         x!
       catch (e)
         print (e.message)' shouldOutput "'uh oh'"

    it 'calling the error inside the promise causes the promise to fail'
      'x = promise @(success, error)
        error (new (Error "uh oh"))

       try
         x!
       catch (e)
         print (e.message)' shouldOutput "'uh oh'"

    it 'can resolve other promises inside the promise, but must call success'
      'x = promise @(success)
         setTimeout ^ 1!
         success("result")

       print (x!)' shouldOutput "'result'"

    it "doesn't take the last expression as the result"
      'x = promise @(success)
         setTimeout
            success("result")
         1!
         "uh oh"

       print (x!)' shouldOutput "'result'"
