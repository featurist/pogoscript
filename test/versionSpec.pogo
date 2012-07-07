versions = require '../lib/versions.pogo'

describe 'comparing versions'
    it 'returns true when "v0.3.1" is less than "v0.4.11"'
        (versions.'v0.3.1' is less than 'v0.4.11').should.be.true

    it 'returns false when "v0.6.0" is less than "v0.4.11"'
        (versions.'v0.6.0' is less than 'v0.4.11').should.be.false

    it 'returns false when "v0.4.11" is less than "v0.4.11"'
        (versions.'v0.4.11' is less than 'v0.4.11').should.be.false
