script = require './scriptAssertions'

should output = script.should output

describe 'if'
    describe 'evaluation'
        it "a `true` hash entry does not need it's value specified"
            'print (
                 if (true)
                     "true"
                 else
                     "false"
             )' should output "'true'"
