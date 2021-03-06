script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'methods'
  describe 'preserving self'
    context 'when a block is called within a method'
      it 'uses the same self as the method'
        'block (b) = b ()

         o = {
             name = "name"

             my method () =
                 block
                     print (self.name)
         }

         o.my method ()' shouldOutput "'name'"

  describe 'splats'
    it 'can be called with splat arguments'
      'o = {
           a method (args, ...) =
               print (args)
       }

       o.a method ([1, 2, 3], ...)' shouldOutput "[ 1, 2, 3 ]"

    context 'when the object is an expression'
      it 'is only invoked once'
        'o () =
             print "created object"
             {
                 a method (args, ...) =
                     print (args)
             }

         o ().a method ([1, 2, 3], ...)' shouldOutput "'created object'
                                                       [ 1, 2, 3 ]"

  describeOptionalsWithDelimiter (block) =
    block ':'
    block '='

  describeOptionalsWithDelimiter @(delim)
    describe "optional arguments with #(delim)"
      it 'methods can take optional arguments'
        "object = {
           method(opts) = print(opts)
         }
         object.method (size #(delim) 10)" shouldOutput '{ size: 10 }'

  describe 'returning promises'
    it 'can return a promise'
      'o = {
         method () =
           p "result"
       }

       print (o.method()!)' shouldOutput "'result'"

    it 'can return a promise by resolving one'
      'o = {
         method () =
           p "result"!
       }

       print (o.method()!)' shouldOutput "'result'"

    it 'can resolve a promise then return a value'
      'o = {
         method () =
           p ()!
           "result"
       }

       print (o.method()!)' shouldOutput "'result'"

    it 'can chain method calls by resolving promises'
      'o = {
         method () =
           p ()!
           {
             method () =
               p ()!
               "result"
           }
       }

       print (o.method()!.method()!)' shouldOutput "'result'"

    it 'can return a promise if defined with !'
      'o = {
         method ()! = "result"
       }

       o.method().then @(result)
         print (result)' shouldOutput "'result'"

    it 'can be called with splat arguments'
      'o = {
         method (args, ...) =
           p ()!
           print (args)
       }

       if (true)
         o.method ([1, 2, 3], ...)!' shouldOutput "[ 1, 2, 3 ]"

    describe 'callback methods'
      it 'can call a method with a callback'
        'o = {
           method (cb) =
             setTimeout @{ cb(nil, "result") } 1
         }

         print (o.method (^)!)' shouldOutput "'result'"

      it 'can call a method with a callback and options'
        'o = {
           method (cb, opts) =
             setTimeout @{ cb(nil, opts) } 1
         }

         print (o.method (a = "a", ^)!)' shouldOutput "{ a: 'a' }"
