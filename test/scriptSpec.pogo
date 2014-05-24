script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'script'
    describe 'integers'
        it 'can denote an integer literally'
            'print 1' shouldOutput '1'

    describe 'new operator'
        it 'can be called with no arguments'
            'print (new (Array))' shouldOutput '[]'
            
        it 'new operator can be called with 1 argument'
            'print (new (Array 1 2 3))' shouldOutput '[ 1, 2, 3 ]'
    
    describe '== has semantics equivalent to === in JS'
        it 'returns false for equality of "" with 0'
            'print ("" == 0)' shouldOutput 'false'
            
        it 'returns true for identical strings'
            'print ("something" == "something")' shouldOutput 'true'
    
    describe 'lists'
        it 'an empty list is just []'
            'print []' shouldOutput '[]'
        
        it 'list entries can be delimited with a comma ","'
            'print [1, 2]' shouldOutput '[ 1, 2 ]'
        
        it 'list entries can be delimited with a newline'
            'print [
                 1
                 2
             ]' shouldOutput '[ 1, 2 ]'
