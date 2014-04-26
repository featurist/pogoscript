script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'blocks'
    it 'can be assigned, when given a parameter'
        'a = @()
           "a"
         
         print (a())' shouldOutput "'a'"

    it 'can be given optional parameters'
        'f (block) = block (optional: "optional")
         
         x = f @(optional: nil)
           optional
         
         print (x)' shouldOutput "'optional'"
