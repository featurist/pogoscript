script = require './scriptAssertions'

should output = script.should output
evaluate script = script.evaluate script

describe 'definitions'
    describe 'definitions cannot shadow other definitions'
        it 'definitions can shadow other definitions'
            'a = 1
            
             f () =
                 a = 3
                 print (a)
             
             f ()
             print (a)' should output "3
                                       1"

        it 'throws when a variable has already been defined in the same scope'
            @{evaluate script 'a = 1
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

        context 'when in functions'
            describe 'parameters cannot be redefined'
                it 'throws when a function redefines a parameter'
                    @{evaluate script 'f (a) =
                                           a = 6'}.should.throw r/variable a is already defined/

                it 'throws when a function redefines an optional parameter'
                    @{evaluate script 'f (a: nil) =
                                           a = 6'}.should.throw r/variable a is already defined/
