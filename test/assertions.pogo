should = require 'chai'.should()

global.should contain fields = (require './containsFields').contains fields
global.(x) should equal (y) = should.equal (x) (y)
global.(x) should be truthy = should.ok (x)
global.(x) should be falsy = should.ok (@not x)
