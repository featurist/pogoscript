script = require './scriptAssertions'

describe 'instanceof operator (::)'
    describe 'Array'
        it "an array is an instance of Array"
            script.'print ([] :: Array)' should output 'true'

        it "a string is not an instance of Array"
            script.'print ("string" :: Array)' should output 'false'

    describe "Object"
        it "an object is an instance of Object"
            script.'print ({} :: Object)' should output 'true'

        it "an array is an instance of Object"
            script.'print ([] :: Object)' should output 'true'

        it "a function is an instance of Object"
            script.'print (@{} :: Object)' should output 'true'

        it "a string is not an instance of Object"
            script.'print ("string" :: Object)' should output 'false'

    describe 'String'
        it "a string is an instance of String"
            script.'print ("thing" :: String)' should output 'true'

        it "a number is not an instance of String"
            script.'print (3 :: String)' should output 'false'

    describe 'Number'
        it "a number is an instance of Number"
            script.'print (9 :: Number)' should output 'true'

        it "a string is not an instance of Number"
            script.'print ("string" :: Number)' should output 'false'

    describe 'Boolean'
        it "a boolean is an instance of Boolean"
            script.'print (true :: Boolean)' should output 'true'

        it "a string is not an instance of Boolean"
            script.'print ("string" :: Boolean)' should output 'false'

    describe 'Function'
        it "a function is an instance of Function"
            script.'print (@{} :: Function)' should output 'true'

        it "a string is not an instance of Function"
            script.'print ("string" :: Function)' should output 'false'
