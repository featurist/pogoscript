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
