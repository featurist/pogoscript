script = require './scriptAssertions'

should output = script.should output

describe 'functions'
    describe 'definitions'
        it 'functions can be defined by placing the arguments to the left of the equals sign "="'
            'succ (n) =
                n + 1
            
             print (succ (1))' should output '2'
        
        describe 'functions with no arguments'
            it 'a function can be defined to have no parameters with empty parens "()"'
                'say hi () =
                    print "hi"
            
                 say hi ()' should output "'hi'"
            
            it "a function's parameters shadow variables in outer scope"
                'foo (a) =
                     print (a)
                
                 a = "outer a"
                 foo "inner a"
                 print (a)' should output "'inner a'
                                           'outer a'"

    describe 'splats'
        it 'a function can be defined with a single splat parameter'
            'foo (args, ...) =
                 print (args)
             
             foo 1 2' should output '[ 1, 2 ]'
        
        it 'a function can be called with more than one splat argument'
            'foo (args, ...) =
                 print (args)
         
             foo 1 [2, 3] ... [4, 5] ... 6' should output '[ 1, 2, 3, 4, 5, 6 ]'
        
        it "a function's splat parameter shadows variables in outer scope"
            'foo (a, ...) =
                 print (a.0)
             
             a = "outer a"
             
             foo "inner a"
             print (a)' should output "'inner a'
                                       'outer a'"
    
    describe 'optional arguments'
        it 'functions can take optional arguments'
            'print (size: 10)' should output '{ size: 10 }'

        it 'a function can be defined to take an optional argument'
            'open tcp connection (host: nil, port: nil) =
                 print (host)
                 print (port)
             
             open tcp connection (host: "pogoscript.org", port: 80)' should output "'pogoscript.org'
                                                                                    80"
        
        it 'if the optional parameter has a default value
            and no optional arguments are passed by the caller,
            then that default value is used'
              
            'open tcp connection (port: 80) =
                 print (port)
             
             open tcp connection ()' should output "80"
        
        it 'if the optional parameter has a default value
            and other optional arguments are passed by the caller
            but not that one, then that default value is used'
              
            'open tcp connection (port: 80) =
                 print (port)
             
             open tcp connection (host: "pogoscript.org")' should output "80"
        
        it "a function's optional parameter shadows variables in outer scope"
            'foo (bar: nil) =
                 print (bar)
             
             bar = "outer bar"
             foo (bar: "inner bar")
             print (bar)' should output "'inner bar'
                                         'outer bar'"
        
        it "a function's optional parameter shadows variables in outer scope,
            even if it has a default value"
              
            'foo (bar: 80) =
                 print (bar)
             
             bar = "outer bar"
             foo (bar: "inner bar")
             print (bar)' should output "'inner bar'
                                         'outer bar'"
        
        it "when a block is passed as an optional argument, it does not redefine self"
            'foo (bar: nil) =
                 bar ()
             
             obj = {
                 field = "field value"
                 method () =
                     foo (bar (): print (self.field))
             }

             obj.method ()' should output "'field value'"

    describe 'redefining self'
        it 'redefines self with the => operator'
            'print self () = =>
                 print (self.x)
             
             print self.call ({x = "self"})' should output "'self'"

    describe 'calling anonymous functions'
        it 'can call an anonymous function'
            'print "thang"
             @{ print "thing" } ()
             print "thong"' should output "'thang'
                                           'thing'
                                           'thong'"

    describe 'calling asynchronous functions'
        context 'when there are no arguments'
            it 'can call an asynchronous function synchronously'
                'f! = 5

                 print (f ())' shouldOutput '5'

        context 'when there is one argument'
            it 'can call an asynchronous function synchronously'
                'f (n)! = n + 1

                 print (f (4))' shouldOutput '5'

            it 'can call an asynchronous function asynchronously without first argument'
                'f (n)! = n

                 print (f ()!)' shouldOutput 'undefined'
