versions = require '../../lib/versions'

describe 'comparing versions'
    it returns (result) when asked if (version1) is less than (version2) =
        it "returns #(result) when \"#(version1)\" is less than \"#(version2)\""
            (versions.(version1) is less than (version2)).should.equal (result)

    it 'returns true when "v0.3.1" is less than "v0.4.11"'
        (versions.'v0.3.1' is less than 'v0.4.11').should.be.true

    it 'returns false when "v0.6.0" is less than "v0.4.11"'
        (versions.'v0.6.0' is less than 'v0.4.11').should.be.false

    it 'returns false when "v0.4.11" is less than "v0.4.11"'
        (versions.'v0.4.11' is less than 'v0.4.11').should.be.false

    it returns (true) when asked if "v0.8.0" is less than "v0.10.0"
    it returns (false) when asked if "v0.10.0" is less than "v0.8.0"
