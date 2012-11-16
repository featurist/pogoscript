script = require './scriptAssertions'

should output = script.should output
evaluate script = script.evaluate script

describe 'definitions'
    describe 'definitions cannot shadow other definitions'
        it 'throws when an inner scope defines a variable of the same name as defined in outer scope'
            @{evaluate script 'a = 1
                      
                               f () =
                                   a = 3'}.should.throw r/variable a already defined/

        it 'can assign to a variable after it has been defined'
            'a = 1
             print (a)

             a := 2
             print (a)' should output "1
                                       2"
        
