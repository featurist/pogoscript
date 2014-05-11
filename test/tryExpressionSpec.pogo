script = require './scriptAssertions'

should output = script.should output
should throw = script.should throw

describe 'try'
  describe 'expression'
    context "when no exceptions are thrown"
      it "returns body of try"
        'a =
           try
             "good"
           catch (e)
             "bad"

         print (a)' should output "'good'"

    context "when exceptions are thrown"
      it "returns body of catch passing the error"
        'a =
           try
             @throw @new Error "bad"
           catch (e)
             e.message

         print (a)' should output "'bad'"

  describe 'statement'
    context "when no exceptions are thrown"
      it "doesn't execute the catch body"
        'try
           print "good"
         catch (e)
           print "bad"' should output "'good'"

    context "when exceptions are thrown"
      it "doesn't execute the rest of the try body and executes the catch body passing the error"
        'try
           @throw @new Error "uh oh"
           print "good"
         catch (e)
           print (e.message)' should output "'uh oh'"

  describe 'promises'
    context "when promise resolution in the body doesn't throw an exception"
      context "and there isn't a finally"
        it "doesn't run the catch and returns the body expression"
          'result = try
             promise ()!
             print "good"
             "result"
           catch (ex)
             promise()!
             print "bad"
          
           print (result)' shouldOutput "'good'
                                         'result'"

      context "and there is a finally"
        it "doesn't run the catch, and does run the finally"
          'result = try
             promise ()!
             print "good"
             "result"
           catch (ex)
             promise()!
             print "bad"
           finally
             promise()!
             print "finally"
           
           print (result)' shouldOutput "'good'
                                         'finally'
                                         'result'"

    context "when promise resolution in the body does throw an exception"
      context "and there isn't a finally"
        it "runs the catch clause and returns the catch clause expression"
          'promiseError () =
             promise ()!
             @throw @new Error "uh oh"
           
           result = try
             promiseError ()!
             print "good"
           catch (ex)
             promise()!
             print (ex.message)
             "result"
          
           print (result)' shouldOutput "'uh oh'
                                         'result'"

      context "and there is a finally"
        it "runs the catch clause and returns the catch clause expression"
          'promiseError () =
             promise ()!
             @throw @new Error "uh oh"
           
           result = try
             promiseError ()!
             print "good"
           catch (ex)
             promise()!
             print (ex.message)
             "result"
           finally
             promise()!
             print "finally"
           
           print (result)' shouldOutput "'uh oh'
                                         'finally'
                                         'result'"
