script = require './scriptAssertions'

shouldOutput = script.shouldOutput
evaluateScript = script.evaluateScript

describe 'definitions'
  describe 'definitions cannot shadow other definitions'
    it 'definitions cannot shadow other definitions'
      @{ evaluateScript 'a = 1

                         f () =
                           a = 3
                           print (a)

                         f ()
                         print (a)'}.should.throw r/variable a is already defined/

    it 'definitions cannot shadow other definitions #2'
      @{ evaluateScript 'f (block) = block()

                         a = 1

                         f
                           a = 2
                           print (a)

                         print (a)'}.should.throw r/variable a is already defined/

    it 'throws when a variable has already been defined in the same scope'
      @{evaluateScript 'a = 1
                        a = 3'}.should.throw r/variable a is already defined/

    it 'can assign to a variable after it has been defined'
      'a = 1
       print (a)

       a := 2
       print (a)' shouldOutput "1
                                2"

    it 'can define variable inside if expression'
      'print (
           if (true)
               b = 1
               b + 1
       )' shouldOutput "2"

    it "throws when an assignment is made to a variable that hasn't been defined yet"
      @{evaluateScript 'a := 1'}.should.throw r/variable a is not defined/

    context 'when in functions'
      describe 'parameters cannot be redefined'
        it 'throws when a function redefines a parameter'
          @{evaluateScript 'f (a) =
                                a = 6'}.should.throw r/variable a is already defined/

        it 'throws when a function redefines an optional parameter'
          @{evaluateScript 'f (a: nil) =
                                a = 6'}.should.throw r/variable a is already defined/

  describe 'scopes'
    describe 'promises'
      it 'promises can be resolved in a scope'
        'a =
           p ("a")!

         print(a)' shouldOutput "'a'"

      it 'promise expressions can be resolved in a scope'
        'a =
           p ("a")! + "b"

         print(a)' shouldOutput "'ab'"

      it 'promise statements can be resolved in a scope'
        'a =
           b = p ("a")!
           b + "c"

         print(a)' shouldOutput "'ac'"
