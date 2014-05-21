script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'if'
  describe 'evaluation'
    it "returns the body"
      'print (
         if (true)
           "true"
         else
           "false"
       )' shouldOutput "'true'"

  describe 'promises'
    context 'when there no else clause'
      it 'resolves promises when in the then clause'
        'result = if (true)
           p ()!
           "result"
         
         print (result)' shouldOutput "'result'"

    context 'when there is an else clause'
      it 'resolves promises when in the else clause'
        'result = if (false)
           p ()!
           print "then"
         else
           p()!
           print "else"
           "result"
         
         print (result)' shouldOutput "'else'
                                       'result'"

    context 'when there are if else and else clauses'
      it 'resolves promises when in the else clause'
        'result = if (false)
           p ()!
           print "then"
         else if (true)
           p()!
           print "else if"
           "result"
         else
           p()!
           print "else"
         
         print (result)' shouldOutput "'else if'
                                       'result'"
