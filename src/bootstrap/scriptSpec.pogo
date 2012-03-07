script = require './scriptAssertions.pogo'
assert = require 'assert'
path = require 'path'

should output = script: should output
should throw = script: should throw
with args should output = script: with args should output

describe 'pogo command'
    it "`process: argv` contains 'pogo', the name of the
         script executed, and the arguments from the command line" @(done)
    
        'console: log (process: argv)' with args ['one', 'two'] should output "[ 'pogo',
                                                                                 '#(path: resolve '086cb9ffe81d17023c281a4789bdf5c45ddc1d76.pogo')',
                                                                                 'one',
                                                                                 'two' ]" (done)

    it "`__filename` should be the name of the script" @(done)
        'console: log (__filename)' with args [] should output (path: resolve "ec798ad9d0e16bd17a4ba1cceab4be9591c65bfe.pogo") (done)

    it "`__dirname` should be the name of the script" @(done)
        'console: log (__dirname)' with args [] should output (path: resolve ".") (done)

describe 'script'
    describe 'integers'
        it 'can denote an integer literally'
            'print 1' should output '1'

    describe 'new operator'
        it 'can be called with no arguments'
            'print (new (Array))' should output '[]'
            
        it 'new operator can be called with 1 argument'
            'print (new (Date 2010 10 9): value of?)' should output '1289260800000'

    describe 'hash'
        it "a `true` hash entry does not need it's value specified"
            'print {one}' should output '{ one: true }'
        
        it 'a hash can have multiple entries, delimited by commas'
            "print {color 'red', size 'large'}" should output "{ color: 'red', size: 'large' }"
        
        it 'a hash can have multiple entries, delimited by dots'
            "print {color 'red'. size 'large'}" should output "{ color: 'red', size: 'large' }"
        
        it 'a hash can have multiple entries, delimited by new lines'
            "print {
                 color 'red'
                 size 'large'
             }" should output "{ color: 'red', size: 'large' }"
        
        it 'hash entries can be written with an equals "=" operator'
            "print {color = 'red', size = 'large'}" should output "{ color: 'red', size: 'large' }"
    
    describe 'lists'
        it 'an empty list is just []'
            'print []' should output '[]'
        
        it 'list entries can be delimited with a comma ","'
            'print [1, 2]' should output '[ 1, 2 ]'
        
        it 'list entries can be delimited with a dot "."'
            'print [1. 2]' should output '[ 1, 2 ]'
        
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
                 
                it 'a function can be defined to have no parameters with the question mark "?"'
                    'index = 0
                 
                     current index? =
                        index
                
                     print (current index?)
                     index = 10
                     print (current index?)' should output '0
                                                            10'
                
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
                     print (a: 0)
                 
                 a = "outer a"
                 
                 foo "inner a"
                 print (a)' should output "'inner a'
                                           'outer a'"
        
        describe 'optional arguments'
            it 'functions can take optional arguments, delimited by semi-colons ";"'
                'print; size 10' should output '{ size: 10 }'
    
            it 'if an optional argument has no value, it is passed as true'
                'print; is red' should output '{ isRed: true }'
            
            it 'a function can be defined to take an optional argument'
                'open tcp connection; host; port =
                     print (host)
                     print (port)
                 
                 open tcp connection; host "pogoscript.org"; port 80' should output "'pogoscript.org'
                                                                                     80"
            
            it 'if the optional parameter has no default value and is not passed by the caller,
                it is defaulted to "undefined"'
                  
                'open tcp connection; host =
                     print (host)
                 
                 open tcp connection!' should output "undefined"
            
            it 'if the optional parameter has a default value
                and no optional arguments are passed by the caller,
                then that default value is used'
                  
                'open tcp connection; port 80 =
                     print (port)
                 
                 open tcp connection!' should output "80"
            
            it 'if the optional parameter has a default value
                and other optional arguments are passed by the caller
                but not that one, then that default value is used'
                  
                'open tcp connection; port 80 =
                     print (port)
                 
                 open tcp connection; host "pogoscript.org"' should output "80"
            
            it "a function's optional parameter shadows variables in outer scope"
                'foo; bar =
                     print (bar)
                 
                 bar = "outer bar"
                 foo; bar ("inner bar")
                 print (bar)' should output "'inner bar'
                                             'outer bar'"
            
            it "a function's optional parameter shadows variables in outer scope,
                even if it has a default value"
                  
                'foo; bar 80 =
                     print (bar)
                 
                 bar = "outer bar"
                 foo; bar ("inner bar")
                 print (bar)' should output "'inner bar'
                                             'outer bar'"

    describe 'scope'
        it 'statements can be delimited by dots in parens, the last statement is returned'
            'print (x = 1. x = x + 1. x)' should output '2'
            
        it 'any variables defined inside the scope are not accessible outside the scope'
            '(x = 1. x = x + 1. x)
             x' should throw 'ReferenceError: x is not defined'
