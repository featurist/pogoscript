script = require './scriptAssertions'

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
  
    context "when it doesn't contain hash entries"
        it 'when it contains a method call, it should throw a parsing exception'
            @{
                script.evaluate script "print {
                                            console.log ('aaahh!')
                                        }"
            }.should.throw r/cannot be a hash entry/

        it 'when it contains a function call, it should throw a parsing exception'
            @{
                script.evaluate script "print {
                                            x (1, 23, 3)
                                        }"
            }.should.throw r/cannot be a hash entry/

        it 'when it contains a colon, it should throw a parsing exception'
            @{
                script.evaluate script "print {
                                          x: 8
                                        }"
            }.should.throw r/Parse error/
