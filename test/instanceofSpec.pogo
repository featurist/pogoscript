script = require './scriptAssertions'

describe 'instanceof operator (::)'
    describe 'Array'
        it "an array is an instance of Array"
            script.'print ([] :: Array)' shouldOutput 'true'

        it "a string is not an instance of Array"
            script.'print ("string" :: Array)' shouldOutput 'false'

    describe "Object"
        it "an object is an instance of Object"
            script.'print ({} :: Object)' shouldOutput 'true'

        it "an array is an instance of Object"
            script.'print ([] :: Object)' shouldOutput 'true'

        it "a function is an instance of Object"
            script.'print (@{} :: Object)' shouldOutput 'true'

        it "a string is not an instance of Object"
            script.'print ("string" :: Object)' shouldOutput 'false'

    describe 'String'
        it "a string is an instance of String"
            script.'print ("thing" :: String)' shouldOutput 'true'

        it "a number is not an instance of String"
            script.'print (3 :: String)' shouldOutput 'false'

    describe 'Number'
        it "a number is an instance of Number"
            script.'print (9 :: Number)' shouldOutput 'true'

        it "a string is not an instance of Number"
            script.'print ("string" :: Number)' shouldOutput 'false'

    describe 'Boolean'
        it "a boolean is an instance of Boolean"
            script.'print (true :: Boolean)' shouldOutput 'true'

        it "a string is not an instance of Boolean"
            script.'print ("string" :: Boolean)' shouldOutput 'false'

    describe 'Function'
        it "a function is an instance of Function"
            script.'print (@{} :: Function)' shouldOutput 'true'

        it "a string is not an instance of Function"
            script.'print ("string" :: Function)' shouldOutput 'false'
