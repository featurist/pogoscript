script = require './scriptAssertions'

shouldOutput = script.shouldOutput
evaluateScript = script.evaluateScript

describe 'definitions'
  describe 'definitions cannot shadow other definitions'
    it 'definitions can shadow other definitions'
      'a = 1
      
       f () =
           a = 3
           print (a)
       
       f ()
       print (a)' shouldOutput "3
                                1"

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

  describe 'or precedence'
    it 'allows assignment in parens'
      'obj = {}
       obj.cache @or (obj.cache = 8)
       print (obj.cache)' shouldOutput '8'

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

      it 'prepares scope correctly'
        'x = 0
 
         a()! =
           if(true)
             x = 7
             p()!
             x
 
         print(a()!)
         print(x)' shouldOutput '7
                                 0'
