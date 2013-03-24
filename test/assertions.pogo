should = require 'should'

global.should contain fields = (require './containsFields').contains fields
global.(x) should equal (y) = should.equal (x) (y)
global.(x) should be truthy = should.exist (x)
global.(x) should be falsy = should.not.exist (x)
