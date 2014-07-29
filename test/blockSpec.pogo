script = require './scriptAssertions'

shouldOutput = script.shouldOutput

describe 'blocks'
    it 'can be assigned, when given a parameter'
        'a = @()
           "a"
         
         print (a())' shouldOutput "'a'"

    describeOptionalsWithDelimiter (block) =
      block ':'
      block '='

    describeOptionalsWithDelimiter @(delim)
      it "can be given optional parameters with #(delim)"
          "f (block) = block (optional #(delim) 'optional')
           
           x = f @(optional #(delim) nil)
             optional
           
           print (x)" shouldOutput "'optional'"

      it "can be given optional parameters after normal with #(delim)"
          "f (block) = block ('arg', optional #(delim) 'optional')
           
           x = f @(arg, optional #(delim) nil)
             arg + optional
           
           print (x)" shouldOutput "'argoptional'"

    describe 'splat parameters'
      it 'can accept splat parameters'
        "f (block) = block (1, 2, 3)
         
         f @(args, ...)
           print (args)" shouldOutput "[ 1, 2, 3 ]"
