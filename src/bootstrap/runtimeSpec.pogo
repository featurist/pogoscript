require './runtime'

describe 'runtime'
    it 'creates objects with constructor'
        obj = object =>
            :a = 'a'
        
        obj: a: should: equal 'a'
    
    it 'creates objects with hash'
        obj = object {
            a = 'a'
        }
        
        obj: a: should: equal 'a'
    
    describe 'inheritance'
        prototype = null
        
        before each
            prototype = object =>
                :a = 'a'
                :b = 'b'
        
        it 'allows objects to be extended'
            obj = object extending (prototype) =>
                :b = 'c'
            
            obj: a: should: equal 'a'
            obj: b: should: equal 'c'
        
        it 'allows objects to be extended using hash'
            obj = object extending (prototype) {
                b = 'c'
            }
            
            obj: a: should: equal 'a'
            obj: b: should: equal 'c'
        
        