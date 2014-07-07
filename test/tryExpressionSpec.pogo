script = require './scriptAssertions'

shouldOutput = script.shouldOutput
shouldThrow = script.shouldThrow

describe 'try'
  describe 'expression'
    context "when no exceptions are thrown"
      it "returns body of try"
        'a =
           try
             "good"
           catch (e)
             "bad"

         print (a)' shouldOutput "'good'"

    context "when exceptions are thrown"
      it "returns body of catch passing the error"
        'a =
           try
             @throw @new Error "bad"
           catch (e)
             e.message

         print (a)' shouldOutput "'bad'"

  describe 'statement'
    context "when no exceptions are thrown"
      it "doesn't execute the catch body"
        'try
           print "good"
         catch (e)
           print "bad"' shouldOutput "'good'"

    context "when exceptions are thrown"
      it "doesn't execute the rest of the try body and executes the catch body passing the error"
        'try
           @throw @new Error "uh oh"
           print "good"
         catch (e)
           print (e.message)' shouldOutput "'uh oh'"

  describe 'promises'
    context "when promise resolution in the body doesn't throw an exception"
      context "and there isn't a finally"
        it "doesn't run the catch and returns the body expression"
          'result = try
             p ()!
             print "good"
             "result"
           catch (ex)
             p()!
             print "bad"
          
           print (result)' shouldOutput "'good'
                                         'result'"

      context "and there is a finally"
        it "doesn't run the catch, and does run the finally"
          'result = try
             p ()!
             print "good"
             "result"
           catch (ex)
             p()!
             print "bad"
           finally
             p()!
             print "finally"
           
           print (result)' shouldOutput "'good'
                                         'finally'
                                         'result'"

    context "when promise resolution in the body does throw an exception"
      context "and there isn't a finally"
        it "runs the catch clause and returns the catch clause expression"
          'promiseError () =
             p ()!
             @throw @new Error "uh oh"
           
           result = try
             promiseError ()!
             print "good"
           catch (ex)
             p()!
             print (ex.message)
             "result"
          
           print (result)' shouldOutput "'uh oh'
                                         'result'"

        it "when it throws a non-promise exception"
          'promiseError () =
             @throw @new Error "uh oh"
           
           result = try
             promiseError ()!
             print "good"
           catch (ex)
             p()!
             print (ex.message)
             "result"
          
           print (result)' shouldOutput "'uh oh'
                                         'result'"

      context "and there is a finally"
        it "runs the catch clause and returns the catch clause expression"
          'promiseError () =
             p ()!
             @throw @new Error "uh oh"
           
           result = try
             promiseError ()!
             print "good"
           catch (ex)
             p()!
             print (ex.message)
             "result"
           finally
             p()!
             print "finally"
           
           print (result)' shouldOutput "'uh oh'
                                         'finally'
                                         'result'"

      context "and there is a finally, but no catch"
        it "runs the finally clause and continues to throw the exception"
          'promiseError () =
             p ()!
             @throw @new Error "uh oh"
           
           result =
             try
               try
                 promiseError ()!
                 print "good"
               finally
                 p()!
                 print "finally"
             catch (e)
               print "outer catch"
               "result"
           
           print (result)' shouldOutput "'finally'
                                         'outer catch'
                                         'result'"

        context 'when the finally clause throws an exception'
          it "runs the finally clause and throws the finally clause exception"
            'promiseError (name) =
               p ()!
               @throw @new Error (name)
             
             result =
               try
                 try
                   promiseError "body"!
                   print "good"
                 finally
                   p()!
                   print "finally"
                   promiseError "finally"!
                   print "finally finished"
               catch (e)
                 print "outer catch: #(e.message)"
                 "result"
             
             print (result)' shouldOutput "'finally'
                                           'outer catch: finally'
                                           'result'"
