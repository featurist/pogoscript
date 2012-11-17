script = require './scriptAssertions'

should output = script.should output
evaluate script = script.evaluate script

describe 'definitions'
    describe 'definitions cannot shadow other definitions'
        it 'throws when an inner scope defines a variable of the same name as defined in outer scope'
            @{evaluate script 'a = 1
                      
                               f () =
                                   a = 3'}.should.throw r/variable a is already defined/

        it 'can assign to a variable after it has been defined'
            'a = 1
             print (a)

             a := 2
             print (a)' should output "1
                                       2"

        it 'can define variable inside if expression'
            'print (
                 if (true)
                     b = 1
                     b + 1
             )' should output "2"

        it "throws when an assignment is made to a variable that hasn't been defined yet"
            @{evaluate script 'a := 1'}.should.throw r/variable a is not defined/
