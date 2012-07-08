script = require './scriptAssertions'
assert = require 'assert'

should output = script.should output
should throw = script.should throw

describe 'hashes'
    describe 'evaluation'
        it "a `true` hash entry does not need it's value specified"
            'print {one}' should output '{ one: true }'
  
        it 'a hash can have multiple entries, delimited by commas'
            "print {color 'red', size 'large'}" should output "{ color: 'red', size: 'large' }"
  
        it 'a hash can have multiple entries, delimited by new lines'
            "print {
                 color 'red'
                 size 'large'
             }" should output "{ color: 'red', size: 'large' }"
  
        it 'hash entries can be written with an equals "=" operator'
            "print {color = 'red', size = 'large'}" should output "{ color: 'red', size: 'large' }"
