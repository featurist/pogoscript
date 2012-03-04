assert = require 'assert'

global: should contain fields = (require '../spec/containsFields'): contains fields
global: (x) should equal (y) = assert: equal (x) (y)
global: (x) should be truthy = assert: ok (x)
global: (x) should be falsy = assert: ok (not (x))
