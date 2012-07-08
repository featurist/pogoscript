script = require './scriptAssertions'
assert = require 'assert'

should output = script.should output
with args should output = script.with args should output

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
