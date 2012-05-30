script = require './scriptAssertions.pogo'

describe 'instanceof operator (::)'
    it "returns true when an object is an instance of a constructor"
        script.'print ([] :: Array)' should output 'true'

    it "returns false when an object is not an instance of a constructor"
        script.'print ({} :: Array)' should output 'false'

    it "returns true when an object is an instance of a distant constructor"
        script.'print ([] :: Object)' should output 'true'
