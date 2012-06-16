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
