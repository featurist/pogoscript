script = require './scriptAssertions.pogo'
assert = require 'assert'
path = require 'path'

should output = script.should output
with args should output = script.with args should output

describe 'pogo command'
    it "`process.argv` contains 'pogo', the name of the
         script executed, and the arguments from the command line" @(done)
    
        'console.log (process.argv)' with args ['one', 'two'] should output "[ 'pogo',
                                                                               '#(path.resolve '343111c34d666435dd7e88265c816cbfdbe68cd3.pogo')',
                                                                               'one',
                                                                               'two' ]" (done)

    it "`__filename` should be the name of the script" @(done)
        'console.log (__filename)' with args [] should output (path.resolve "5be55a44c52f14d048d19c020fd913199ae2e61c.pogo") (done)

    it "`__dirname` should be the name of the script" @(done)
        'console.log (__dirname)' with args [] should output (path.resolve ".") (done)
    
    it "runs script files even if they don't use the .pogo extension" @(done)
        'console.log "hi"' with args [] should output 'hi' (script filename: 'ascript')
            done!

describe 'script'
    describe 'integers'
        it 'can denote an integer literally'
            'print 1' should output '1'

    describe 'new operator'
        it 'can be called with no arguments'
            'print (new (Array))' should output '[]'
            
        it 'new operator can be called with 1 argument'
            'print (new (Date 2010 10 9).value of())' should output '1289260800000'
    
    describe '== has semantics equivalent to === in JS'
        it 'returns false for equality of "" with 0'
            'print ("" == 0)' should output 'false'
            
        it 'returns true for identical strings'
            'print ("something" == "something")' should output 'true'
    
    describe 'lists'
        it 'an empty list is just []'
            'print []' should output '[]'
        
        it 'list entries can be delimited with a comma ","'
            'print [1, 2]' should output '[ 1, 2 ]'
        
        it 'list entries can be delimited with a newline'
            'print [
                 1
                 2
             ]' should output '[ 1, 2 ]'
    
    describe 'functions'
        describe 'definitions'
            it 'functions can be defined by placing the arguments to the left of the equals sign "="'
                'succ (n) =
                    n + 1
                
                 print (succ (1))' should output '2'
            
            describe 'functions with no arguments'
                it 'a function can be defined to have no parameters with the exclamation mark "!"'
                    'say hi! =
                        print "hi"
                
                     say hi!' should output "'hi'"
                 
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
                 
                 open tcp connection!' should output "80"
            
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

        describe 'for'
            it 'can be returned from'
                'count to three () =
                     for (n = 0, n < 10, n = n + 1)
                         if (n > 2)
                             return "three"

                 print (count to three ())' should output '''three'''
                
            it 'can be returned from'
                'items = [[1, 2, 3], [1, 2], [1]]
                
                 for each @(item) in (items)
                   item count () = return (item.length)

                   print (item count ())' should output '3
                                                         2
                                                         1'
                
            it 'can loop'
                'count to three () =
                     for (n = 0, n < 10, n = n + 1)
                         print (n)

                 count to three ()' should output '0
                                                   1
                                                   2
                                                   3
                                                   4
                                                   5
                                                   6
                                                   7
                                                   8
                                                   9'
                
