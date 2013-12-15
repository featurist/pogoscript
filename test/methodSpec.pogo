script = require './scriptAssertions'

should output = script.should output

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

                 o.my method ()' should output "'name'"

    describe 'splats'
        it 'can be called with splat arguments'
            'o = {
                 a method (args, ...) =
                     print (args)
             }

             o.a method ([1, 2, 3], ...)' should output "[ 1, 2, 3 ]"

        context 'when the object is an expression'
            it 'is only invoked once'
                'o () =
                     print "created object"
                     {
                         a method (args, ...) =
                             print (args)
                     }

                 o ().a method ([1, 2, 3], ...)' should output "'created object'
                                                                [ 1, 2, 3 ]"
